<script lang="ts">
	import { toaster } from '$lib/toaster.svelte';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import X from '@lucide/svelte/icons/x';
	import { fly } from 'svelte/transition';
</script>

<!--
	Mounted by the layout and never removed, even while empty: a live region has
	to be in the document before the text lands in it, or a screen reader has
	nothing to announce. `polite` because a confirmation must wait its turn rather
	than interrupt whatever is being read.

	Centred at the bottom on a phone and pinned bottom-right once there is room -
	a corner toast on a narrow screen ends up either clipped or on top of the
	thumb. The container ignores the pointer so it never covers the page; each
	message takes it back.
-->
<div
	role="status"
	aria-live="polite"
	class="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
	onpointerenter={() => toaster.pause()}
	onpointerleave={() => toaster.resume()}
	onfocusin={() => toaster.pause()}
	onfocusout={() => toaster.resume()}
>
	{#each toaster.items as item (item.id)}
		<div
			class="bg-popover text-popover-foreground pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg"
			transition:fly={{ y: 8, duration: 150 }}
		>
			<CircleCheck class="text-success mt-0.5 size-5 shrink-0" aria-hidden="true" />

			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium">{item.message}</p>
				{#if item.description}
					<p class="text-muted-foreground mt-0.5 text-xs">{item.description}</p>
				{/if}
			</div>

			<button
				type="button"
				aria-label="Dismiss"
				onclick={() => toaster.dismiss(item.id)}
				class="text-muted-foreground hover:text-foreground focus-visible:ring-ring -m-1 shrink-0 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
			>
				<X class="size-4" />
			</button>
		</div>
	{/each}
</div>
