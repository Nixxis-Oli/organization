<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import InviteWizard from '$lib/components/invite-wizard.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import { appRights, roleOf, users as stored, type AppRight, type User } from '$lib/data';
	import { toaster } from '$lib/toaster.svelte';
	import { cn } from '$lib/utils';
	import Search from '@lucide/svelte/icons/search';
	import UserPlus from '@lucide/svelte/icons/user-plus';

	function clone(list: User[]) {
		return list.map((user) => ({ ...user, apps: [...user.apps] }));
	}

	// The switches are a draft until Save; Cancel restores the baseline, which is
	// what Save last wrote. Invitations are NOT part of that draft - see invite().
	let baseline = $state(clone(stored));
	let draft = $state(clone(stored));
	let query = $state('');
	let inviting = $state(false);
	let saved = $state(false);

	const dirty = $derived(JSON.stringify(draft) !== JSON.stringify(baseline));

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
		const invited: User[] = emails.map((email, index) => ({
			id: `pending-${Date.now()}-${index}`,
			name: email.split('@')[0].replace(/[._-]+/g, ' '),
			email,
			lastSeen: 'invited',
			apps: [...apps]
		}));

		// The email leaves when the wizard sends it, so these people are not a
		// pending change: they go into the baseline as well as the draft. That
		// keeps Save disabled if nothing else was touched, and keeps Cancel from
		// pretending it can call back a message that has already gone out.
		draft = [...draft, ...invited];
		baseline = [...baseline, ...clone(invited)];

		toaster.show(
			emails.length > 1
				? `${emails.length} invitations sent`
				: `Invitation sent to ${emails[0]}`,
			'They pick their own password from the email.'
		);
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

<!-- The table and the card list below show the same rows. These snippets are the
	 pieces they share, so the two renderings cannot drift apart. -->
{#snippet avatar(user: User)}
	<span
		class="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
		aria-hidden="true"
	>
		{initials(user.name)}
	</span>
{/snippet}

{#snippet rightSwitch(user: User, right: AppRight, fillRow = false)}
	<Switch
		checked={user.apps.includes(right.id)}
		onchange={() => toggle(user, right.id)}
		aria-label="{right.label} for {user.name}"
		disabled={user.owner}
		class={cn(
			user.owner && 'cursor-not-allowed opacity-60',
			// On a card the switch is the row's only control, so it grows a
			// pseudo-element over the whole row: the touch target becomes the row
			// rather than the 44x24 track. A wrapping <label> would read the same,
			// but not every browser forwards a label click to a button.
			fillRow && 'before:absolute before:inset-0 before:content-[""]'
		)}
	/>
{/snippet}

{#snippet soonTag(extra?: string)}
	<span class={cn('bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px]', extra)}>
		soon
	</span>
{/snippet}

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

	<!--
		Seven columns need the 48rem the table asks for. Below that the same rows are
		cards instead, so nothing ever scrolls sideways: on a phone the switches are
		the first thing under the thumb rather than 460px off-screen, and the name
		stays beside them. The threshold is a container query, not a viewport one -
		the sidebar is collapsible and resizable, so the viewport width says nothing
		about the room actually left for the table.
	-->
	<div class="@container">
		<ul class="space-y-3 @3xl:hidden">
			{#each filtered as user (user.id)}
				{@const role = roleOf(user)}
				<li class="bg-card rounded-xl border">
					<div class="flex items-center gap-3 border-b p-4">
						{@render avatar(user)}
						<div class="min-w-0 flex-1">
							<p class="truncate font-medium capitalize">{user.name}</p>
							<p class="text-muted-foreground truncate text-xs">
								{user.email} · {user.lastSeen}
							</p>
						</div>
						<Badge variant={role === 'Member' ? 'muted' : 'secondary'}>{role}</Badge>
					</div>

					<ul class="divide-y">
						{#each appRights as right (right.id)}
							<li class="relative flex min-h-12 items-center justify-between gap-3 px-4 py-2">
								<span class="flex items-center gap-1.5 text-sm">
									{right.label}
									{#if right.ready === false}
										{@render soonTag()}
									{/if}
								</span>
								{@render rightSwitch(user, right, true)}
							</li>
						{/each}
					</ul>
				</li>
			{:else}
				<li class="bg-card text-muted-foreground rounded-xl border px-4 py-10 text-center">
					No member matches “{query}”.
				</li>
			{/each}
		</ul>

		<div class="bg-card hidden rounded-xl border @3xl:block">
			<table class="w-full text-sm">
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
										{@render soonTag('normal-case')}
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
									{@render avatar(user)}
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
										{@render rightSwitch(user, right)}
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
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<Button onclick={save} disabled={!dirty}>Save</Button>
		<Button variant="outline" onclick={cancel} disabled={!dirty}>Cancel</Button>

		{#if saved}
			<span class="text-muted-foreground text-sm">Saved — in this mockup, nothing is stored.</span>
		{:else if dirty}
			<span class="text-muted-foreground text-sm">Unsaved changes.</span>
		{/if}
	</div>

	<p class="text-muted-foreground text-xs">
		The owner keeps every application; those switches are locked. Turning Organization on makes
		someone an administrator.
	</p>
</div>

<InviteWizard bind:open={inviting} oninvite={invite} />
