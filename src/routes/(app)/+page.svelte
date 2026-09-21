<script lang="ts">
	import { base } from '$app/paths';
	import Card from '$lib/components/ui/card.svelte';
	import { appRights, organization, roleOf, users } from '$lib/data';
	import Building from '@lucide/svelte/icons/building';
	import Settings from '@lucide/svelte/icons/settings';
	import Users from '@lucide/svelte/icons/users';

	// Counts, not charts: four numbers and a per-application tally is all this
	// screen has to say, and a bar chart of four bars would say it worse.
	const admins = users.filter((user) => roleOf(user) !== 'Member').length;

	const perApp = appRights.map((right) => ({
		...right,
		count: users.filter((user) => user.apps.includes(right.id)).length
	}));

	const stats = [
		{ label: 'Members', value: users.length, hint: `${admins} with admin rights` },
		{ label: 'Applications', value: appRights.length, hint: 'available to grant' },
		{ label: 'Retention', value: `${organization.retentionDays} days`, hint: 'conversation history' },
		{ label: 'Sign-in', value: organization.requireSso ? 'SSO' : 'Password', hint: 'enforced for everyone' }
	];
</script>

<svelte:head><title>Overview - Organization</title></svelte:head>

<div class="space-y-8 p-4 md:p-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">{organization.name}</h1>
		<p class="text-muted-foreground mt-1 text-sm">
			Who belongs to this organization, and what they are allowed to open.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each stats as stat (stat.label)}
			<Card class="p-5">
				<p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
					{stat.label}
				</p>
				<p class="mt-2 text-3xl font-semibold tabular-nums">{stat.value}</p>
				<p class="text-muted-foreground mt-1 text-xs">{stat.hint}</p>
			</Card>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<Card class="p-6 lg:col-span-2">
			<h2 class="font-semibold">Access by application</h2>
			<p class="text-muted-foreground mt-1 text-sm">
				How many members can start each application today.
			</p>

			<ul class="mt-5 space-y-4">
				{#each perApp as app (app.id)}
					{@const share = users.length ? (app.count / users.length) * 100 : 0}
					<li>
						<div class="flex items-baseline justify-between gap-4 text-sm">
							<span class="font-medium">{app.label}</span>
							<span class="text-muted-foreground tabular-nums">
								{app.count} of {users.length}
							</span>
						</div>
						<!-- The number is stated beside the bar, so the bar only has to
							 carry the comparison. -->
						<div class="bg-muted mt-2 h-2 overflow-hidden rounded-full">
							<div class="bg-primary h-full rounded-full" style="width: {share}%"></div>
						</div>
					</li>
				{/each}
			</ul>
		</Card>

		<div class="space-y-4">
			<a href="{base}/users" class="block">
				<Card class="hover:border-primary/60 p-5 transition-colors">
					<Users class="text-primary size-5" />
					<p class="mt-3 font-semibold">Manage users</p>
					<p class="text-muted-foreground mt-1 text-sm">
						Invite people and switch their applications on or off.
					</p>
				</Card>
			</a>

			<a href="{base}/settings" class="block">
				<Card class="hover:border-primary/60 p-5 transition-colors">
					<Settings class="text-primary size-5" />
					<p class="mt-3 font-semibold">Organization settings</p>
					<p class="text-muted-foreground mt-1 text-sm">
						Rename the organization and set the general parameters.
					</p>
				</Card>
			</a>

			<Card class="text-muted-foreground p-5 text-sm">
				<Building class="size-5" />
				<p class="mt-3">
					Mockup data. Nothing here is stored — reloading the page brings everything back.
				</p>
			</Card>
		</div>
	</div>
</div>
