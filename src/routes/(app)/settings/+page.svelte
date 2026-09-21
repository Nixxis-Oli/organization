<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import { organization } from '$lib/data';

	const TIMEZONES = ['Europe/Brussels', 'Europe/London', 'Europe/Madrid', 'UTC'];
	const LOCALES = ['en-GB', 'en-US', 'fr-BE', 'nl-BE'];
	const RETENTION = ['30', '90', '180', '365'];

	// Editing a copy, so Cancel is a restore rather than a reload.
	function fresh() {
		return {
			name: organization.name,
			timezone: organization.timezone,
			locale: organization.locale,
			retentionDays: String(organization.retentionDays),
			requireSso: organization.requireSso,
			allowSelfSignup: organization.allowSelfSignup
		};
	}

	let form = $state(fresh());
	let saved = $state(false);

	const dirty = $derived(JSON.stringify(form) !== JSON.stringify(fresh()));

	function save() {
		// Deliberately a no-op: this mockup writes nothing back.
		saved = true;
		setTimeout(() => (saved = false), 2500);
	}
</script>

<svelte:head><title>Settings - Organization</title></svelte:head>

<div class="space-y-6 p-4 md:p-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
		<p class="text-muted-foreground mt-1 text-sm">
			The name people see, and the parameters that apply to everyone.
		</p>
	</div>

	<div class="grid max-w-3xl gap-6">
		<Card class="space-y-5 p-6">
			<div>
				<h2 class="font-semibold">Identity</h2>
				<p class="text-muted-foreground mt-1 text-sm">
					Shown in the toolbar and on every invitation email.
				</p>
			</div>

			<div class="max-w-sm space-y-2">
				<Label for="org-name">Organization name</Label>
				<Input id="org-name" bind:value={form.name} />
			</div>
		</Card>

		<Card class="space-y-5 p-6">
			<div>
				<h2 class="font-semibold">Regional</h2>
				<p class="text-muted-foreground mt-1 text-sm">
					Defaults for members who have not chosen their own.
				</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-3">
				<div class="space-y-2">
					<Label for="org-timezone">Time zone</Label>
					<Select id="org-timezone" bind:value={form.timezone} options={TIMEZONES} />
				</div>

				<div class="space-y-2">
					<Label for="org-locale">Language</Label>
					<Select id="org-locale" bind:value={form.locale} options={LOCALES} />
				</div>

				<div class="space-y-2">
					<Label for="org-retention">Retention (days)</Label>
					<Select id="org-retention" bind:value={form.retentionDays} options={RETENTION} />
				</div>
			</div>
		</Card>

		<Card class="space-y-5 p-6">
			<div>
				<h2 class="font-semibold">Access</h2>
				<p class="text-muted-foreground mt-1 text-sm">How people get in.</p>
			</div>

			<div class="divide-y">
				<div class="flex items-center justify-between gap-4 pb-4">
					<div class="min-w-0">
						<p class="text-sm font-medium">Require single sign-on</p>
						<p class="text-muted-foreground text-xs">
							Members sign in through the company identity provider only.
						</p>
					</div>
					<Switch bind:checked={form.requireSso} aria-label="Require single sign-on" />
				</div>

				<div class="flex items-center justify-between gap-4 pt-4">
					<div class="min-w-0">
						<p class="text-sm font-medium">Allow self sign-up</p>
						<p class="text-muted-foreground text-xs">
							Anyone with a company address can join without an invitation.
						</p>
					</div>
					<Switch bind:checked={form.allowSelfSignup} aria-label="Allow self sign-up" />
				</div>
			</div>
		</Card>
	</div>

	<div class="flex max-w-3xl items-center gap-3">
		<Button onclick={save} disabled={!dirty}>Save</Button>
		<Button variant="outline" onclick={() => (form = fresh())} disabled={!dirty}>Cancel</Button>

		{#if saved}
			<span class="text-muted-foreground text-sm">Saved — in this mockup, nothing is stored.</span>
		{:else if dirty}
			<span class="text-muted-foreground text-sm">Unsaved changes.</span>
		{/if}
	</div>
</div>
