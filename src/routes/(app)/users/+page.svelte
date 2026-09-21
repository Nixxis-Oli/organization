<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import InviteWizard from '$lib/components/invite-wizard.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import { appRights, roleOf, users as stored, type User } from '$lib/data';
	import Search from '@lucide/svelte/icons/search';
	import UserPlus from '@lucide/svelte/icons/user-plus';

	function clone(list: User[]) {
		return list.map((user) => ({ ...user, apps: [...user.apps] }));
	}

	// Everything on this page is a draft until Save: the switches, and the people
	// the wizard adds. Cancel restores the baseline, which is what Save last wrote.
	let baseline = $state(clone(stored));
	let draft = $state(clone(stored));
	let query = $state('');
	let inviting = $state(false);
	let saved = $state(false);

	const dirty = $derived(JSON.stringify(draft) !== JSON.stringify(baseline));
	const pendingInvites = $derived(draft.filter((user) => user.lastSeen === 'invited').length);

	const filtered = $derived(
		draft.filter((user) => {
			const needle = query.trim().toLowerCase();
			return (
				!needle ||
				user.name.toLowerCase().includes(needle) ||
				user.email.toLowerCase().includes(needle) ||
				roleOf(user).toLowerCase().includes(needle)
			);
		})
	);

	function toggle(user: User, appId: string) {
		user.apps = user.apps.includes(appId)
			? user.apps.filter((id) => id !== appId)
			: [...user.apps, appId];
	}

	function initials(name: string) {
		return name
			.split(' ')
			.map((part) => part[0])
			.slice(0, 2)
			.join('');
	}

	function invite(emails: string[], apps: string[]) {
		draft = [
			...draft,
			...emails.map((email, index) => ({
				id: `pending-${Date.now()}-${index}`,
				name: email.split('@')[0].replace(/[._-]+/g, ' '),
				email,
				lastSeen: 'invited',
				apps: [...apps]
			}))
		];
	}

	function save() {
		// Deliberately a no-op beyond the page: this mockup writes nothing back.
		baseline = clone(draft);
		saved = true;
		setTimeout(() => (saved = false), 2500);
	}

	function cancel() {
		draft = clone(baseline);
	}
</script>

<svelte:head><title>Users - Organization</title></svelte:head>

<div class="space-y-6 p-4 md:p-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Users</h1>
			<p class="text-muted-foreground mt-1 text-sm">
				{draft.length} members. Switch an application on to let someone start it.
			</p>
		</div>

		<Button variant="outline" onclick={() => (inviting = true)}>
			<UserPlus class="size-4" />
			Invite people
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
		/>
		<Input bind:value={query} placeholder="Search members" class="ps-9" aria-label="Search members" />
	</div>

	<!-- The table is wider than a phone: it scrolls inside its own box rather than
		 pushing the page sideways. -->
	<div class="bg-card overflow-x-auto rounded-xl border">
		<table class="w-full min-w-3xl text-sm">
			<thead class="text-muted-foreground border-b text-xs tracking-wider uppercase">
				<tr>
					<th scope="col" class="px-4 py-3 text-left font-semibold">Member</th>
					<th scope="col" class="px-4 py-3 text-left font-semibold">Role</th>
					<th scope="col" class="px-4 py-3 text-left font-semibold">Last seen</th>
					{#each appRights as right (right.id)}
						<th scope="col" class="px-4 py-3 text-center font-semibold">
							<span class="inline-flex items-center gap-1.5">
								{right.label}
								{#if right.ready === false}
									<span
										class="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] normal-case"
									>
										soon
									</span>
								{/if}
							</span>
						</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#each filtered as user (user.id)}
					{@const role = roleOf(user)}
					<tr class="border-b last:border-0">
						<td class="px-4 py-3">
							<div class="flex items-center gap-3">
								<span
									class="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
									aria-hidden="true"
								>
									{initials(user.name)}
								</span>
								<div class="min-w-0">
									<p class="truncate font-medium capitalize">{user.name}</p>
									<p class="text-muted-foreground truncate text-xs">{user.email}</p>
								</div>
							</div>
						</td>

						<td class="px-4 py-3">
							<Badge variant={role === 'Member' ? 'muted' : 'secondary'}>{role}</Badge>
						</td>

						<td class="text-muted-foreground px-4 py-3 whitespace-nowrap">{user.lastSeen}</td>

						{#each appRights as right (right.id)}
							<td class="px-4 py-3">
								<div class="flex justify-center">
									<Switch
										checked={user.apps.includes(right.id)}
										onchange={() => toggle(user, right.id)}
										aria-label="{right.label} for {user.name}"
										disabled={user.owner}
										class={user.owner ? 'cursor-not-allowed opacity-60' : ''}
									/>
								</div>
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td colspan={3 + appRights.length} class="text-muted-foreground px-4 py-10 text-center">
							No member matches “{query}”.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<Button onclick={save} disabled={!dirty}>Save</Button>
		<Button variant="outline" onclick={cancel} disabled={!dirty}>Cancel</Button>

		{#if saved}
			<span class="text-muted-foreground text-sm">Saved — in this mockup, nothing is stored.</span>
		{:else if dirty}
			<span class="text-muted-foreground text-sm">
				Unsaved changes.{#if pendingInvites}
					{' '}Invitations go out when you save.{/if}
			</span>
		{/if}
	</div>

	<p class="text-muted-foreground text-xs">
		The owner keeps every application; those switches are locked. Turning Organization on makes
		someone an administrator.
	</p>
</div>

<InviteWizard bind:open={inviting} oninvite={invite} />
