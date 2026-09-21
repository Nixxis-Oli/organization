<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Steps from '$lib/components/steps.svelte';
	import Switch from '$lib/components/ui/switch.svelte';
	import { appRights } from '$lib/data';
	import { Dialog } from 'bits-ui';

	// Three steps: who, what they may start, and a last look before sending.
	// Nothing is sent - this demo has no back end.
	type Props = { open: boolean; oninvite?: (emails: string[], apps: string[]) => void };

	let { open = $bindable(), oninvite }: Props = $props();

	const STEPS = [
		{ id: 'people', label: 'People' },
		{ id: 'access', label: 'Access' },
		{ id: 'review', label: 'Review' }
	];

	let current = $state(0);
	let raw = $state('');
	let granted = $state<string[]>(['monitoring']);

	// Accepts whatever separator someone pastes: commas, semicolons, newlines.
	const entries = $derived(
		raw
			.split(/[\s,;]+/)
			.map((entry) => entry.trim())
			.filter(Boolean)
	);

	const valid = $derived(entries.filter((entry) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(entry)));
	const invalid = $derived(entries.filter((entry) => !valid.includes(entry)));

	const canAdvance = $derived(current !== 0 || (valid.length > 0 && invalid.length === 0));

	function toggle(id: string) {
		granted = granted.includes(id) ? granted.filter((x) => x !== id) : [...granted, id];
	}

	function reset() {
		current = 0;
		raw = '';
		granted = ['monitoring'];
	}

	function send() {
		oninvite?.(valid, granted);
		open = false;
		reset();
	}
</script>

<Dialog.Root bind:open onOpenChange={(next) => !next && reset()}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
		<Dialog.Content
			class="bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-xl border p-6 shadow-xl"
		>
			<div class="space-y-1">
				<Dialog.Title class="text-lg font-semibold">Invite people</Dialog.Title>
				<Dialog.Description class="text-muted-foreground text-sm">
					They receive an email and pick their own password.
				</Dialog.Description>
			</div>

			<Steps steps={STEPS} bind:current {canAdvance}>
				{#if current === 0}
					<div class="space-y-2">
						<Label for="emails">Email addresses</Label>
						<textarea
							id="emails"
							bind:value={raw}
							rows="5"
							placeholder="marine@example.com, tomas@example.com"
							class="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
						></textarea>

						<p class="text-muted-foreground text-xs">
							Separate them with commas, semicolons or new lines.
						</p>

						{#if invalid.length}
							<p class="text-destructive text-xs">
								Not an email address: {invalid.join(', ')}
							</p>
						{:else if valid.length}
							<p class="text-muted-foreground text-xs">
								{valid.length} address{valid.length > 1 ? 'es' : ''} ready.
							</p>
						{/if}
					</div>
				{:else if current === 1}
					<div class="space-y-1">
						<p class="text-muted-foreground mb-3 text-sm">
							Which applications these people may start. This can be changed per person
							afterwards.
						</p>

						{#each appRights as right (right.id)}
							<div class="flex items-center justify-between gap-4 border-b py-3 last:border-0">
								<div class="min-w-0">
									<p class="text-sm font-medium">{right.label}</p>
									<p class="text-muted-foreground text-xs">{right.description}</p>
								</div>
								<Switch
									checked={granted.includes(right.id)}
									name={right.id}
									onchange={() => toggle(right.id)}
								/>
							</div>
						{/each}
					</div>
				{:else}
					<div class="space-y-4 text-sm">
						<div>
							<p class="text-muted-foreground text-xs">Inviting</p>
							<ul class="mt-1 space-y-0.5">
								{#each valid as email (email)}
									<li class="font-medium">{email}</li>
								{/each}
							</ul>
						</div>

						<div>
							<p class="text-muted-foreground text-xs">May start</p>
							<p class="mt-1 font-medium">
								{#if granted.length}
									{appRights
										.filter((right) => granted.includes(right.id))
										.map((right) => right.label)
										.join(', ')}
								{:else}
									Nothing yet — they will be able to sign in but not open an application.
								{/if}
							</p>
						</div>

						<Button class="w-full" onclick={send}>
							Send {valid.length} invitation{valid.length > 1 ? 's' : ''}
						</Button>
					</div>
				{/if}
			</Steps>

			<Dialog.Close
				class="text-muted-foreground hover:text-foreground absolute top-4 right-4 text-sm transition-colors"
				aria-label="Close"
			>
				✕
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
