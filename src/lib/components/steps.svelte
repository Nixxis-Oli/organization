<script lang="ts">
	import { cn } from '$lib/utils';
	import Check from '@lucide/svelte/icons/check';
	import type { Snippet } from 'svelte';

	// A stepper, written here rather than pulled in: bits-ui has no Steps, and the
	// behaviour is a bounded index plus two guards. The anatomy follows the usual
	// shape - a list of indicators with separators, then the current panel, then
	// the previous/next pair.
	type Props = {
		steps: { id: string; label: string }[];
		current: number;
		/** Blocks Next while the current panel is incomplete. */
		canAdvance?: boolean;
		children: Snippet;
	};

	let { steps, current = $bindable(), canAdvance = true, children }: Props = $props();

	const isLast = $derived(current === steps.length - 1);
</script>

<div class="space-y-5">
	<ol class="flex items-center gap-2">
		{#each steps as step, index (step.id)}
			{@const done = index < current}
			{@const active = index === current}

			<li class="flex min-w-0 items-center gap-2">
				<!-- The number is the second channel: state is never carried by the
					 fill colour alone. A completed step swaps it for a check. -->
				<span
					class={cn(
						'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
						done && 'bg-primary text-primary-foreground border-transparent',
						active && 'border-primary text-primary',
						!done && !active && 'text-muted-foreground'
					)}
					aria-hidden="true"
				>
					{#if done}
						<Check class="size-3.5" />
					{:else}
						{index + 1}
					{/if}
				</span>

				<span
					class={cn(
						'truncate text-xs',
						active ? 'text-foreground font-medium' : 'text-muted-foreground'
					)}
				>
					{step.label}
				</span>
			</li>

			{#if index < steps.length - 1}
				<li aria-hidden="true" class="bg-border h-px min-w-4 flex-1"></li>
			{/if}
		{/each}
	</ol>

	<div>
		{@render children()}
	</div>

	<div class="flex items-center justify-between gap-3 border-t pt-4">
		<span class="text-muted-foreground text-xs">
			Step {current + 1} of {steps.length}
		</span>

		<div class="flex gap-2">
			<button
				type="button"
				disabled={current === 0}
				onclick={() => (current -= 1)}
				class="border-input hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
			>
				Back
			</button>

			{#if !isLast}
				<button
					type="button"
					disabled={!canAdvance}
					onclick={() => (current += 1)}
					class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-md px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
				>
					Next
				</button>
			{/if}
		</div>
	</div>
</div>
