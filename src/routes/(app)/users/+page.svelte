<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import InviteWizard from '$lib/components/invite-wizard.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import { appRights, users as seed, type User } from '$lib/data';
	import Search from '@lucide/svelte/icons/search';
	import UserPlus from '@lucide/svelte/icons/user-plus';

	// A local copy: the switches have to move somewhere, and there is no back end
	// behind this mockup.
	let users = $state<User[]>(seed.map((user) => ({ ...user, apps: [...user.apps] })));
	let query = $state('');
	let inviting = $state(false);
	let lastInvite = $state<string | null>(null);

	const filtered = $derived(
		users.filter((user) => {
			const needle = query.trim().toLowerCase();
			return (
				!needle ||
				user.name.toLowerCase().includes(needle) ||
				user.email.toLowerCase().includes(needle) ||
				user.role.toLowerCase().includes(needle)
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
		// The invited people are shown straight away, pending, so the wizard has a
		// visible effect.
		users = [
			...users,
			...emails.map((email, index) => ({
				id: `pending-${Date.now()}-${index}`,
				name: email.split('@')[0].replace(/[._-]+/g, ' '),
				email,
				role: 'Member' as const,
				lastSeen: 'invited',
				apps: [...apps]
			}))
		];

		lastInvite = `${emails.length} invitation${emails.length > 1 ? 's' : ''} sent.`;
	}
</script>

<svelte:head><title>Users - Organization</title></svelte:head>

<div class="space-y-6 p-4 md:p-8">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">Users</h1>
			<p class="text-muted-foreground mt-1 text-sm">
				{users.length} members. Switch an application on to let someone start it.
			</p>
		</div>

		<Button onclick={() => (inviting = true)}>
			<UserPlus class="size-4" />
			Invite people
		</Button>
	</div>

	{#if lastInvite}
		<p class="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">{lastInvite}</p>
	{/if}

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
						<th scope="col" class="px-4 py-3 text-center font-semibold">{right.label}</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#each filtered as user (user.id)}
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
							<Badge variant={user.role === 'Member' ? 'muted' : 'secondary'}>{user.role}</Badge>
						</td>

						<td class="text-muted-foreground px-4 py-3 whitespace-nowrap">{user.lastSeen}</td>

						{#each appRights as right (right.id)}
							<td class="px-4 py-3">
								<div class="flex justify-center">
									<Switch
										checked={user.apps.includes(right.id)}
										onchange={() => toggle(user, right.id)}
										aria-label="{right.label} for {user.name}"
										disabled={user.role === 'Owner'}
										class={user.role === 'Owner' ? 'cursor-not-allowed opacity-60' : ''}
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

	<p class="text-muted-foreground text-xs">
		The owner keeps every application; those switches are locked.
	</p>
</div>

<InviteWizard bind:open={inviting} oninvite={invite} />
