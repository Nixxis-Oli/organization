<script lang="ts">
	import { cn } from '$lib/utils';
	import { Switch } from 'bits-ui';

	// `onchange` is for switches whose state is derived from a list rather than
	// owned by them - binding alone would fight the derivation.
	type Props = {
		checked: boolean;
		name?: string;
		class?: string;
		onchange?: (checked: boolean) => void;
		/** Spread onto the root, for the aria-label a bare switch in a table needs. */
		[key: string]: unknown;
	};

	let { checked = $bindable(), name, class: className, onchange, ...rest }: Props = $props();
</script>

<Switch.Root
	{checked}
	onCheckedChange={(next) => {
		checked = next;
		onchange?.(next);
	}}
	{name}
	{...rest}
	class={cn(
		'focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=unchecked]:bg-secondary peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
		className
	)}
>
	<Switch.Thumb
		class="bg-background pointer-events-none block size-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
	/>
</Switch.Root>
