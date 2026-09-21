<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { apps, palettes } from '$lib/apps';
	import { navSections } from '$lib/nav';
	import { createSidebar, MAX_WIDTH, MIN_WIDTH } from '$lib/sidebar.svelte';
	import { ToolbarActions } from '@nixxis-oli/ui';

	let { children } = $props();

	// The same sidebar mechanism as bot-studio - collapsible offcanvas, resizable
	// by its right edge, an overlay below md. Only the mechanism is shared; the
	// sections and labels inside belong to this application.
	const sidebar = createSidebar();

	// The pre-paint script in app.html sets --sidebar-width on :root; this keeps
	// it in step while the handle is dragged.
	$effect(() => {
		document.documentElement.style.setProperty('--sidebar-width', `${sidebar.width}px`);
	});
</script>

<svelte:window onkeydown={(event) => sidebar.handleShortcut(event)} />

<!--
	Offcanvas collapse: a spacer in normal flow animates its width to 0 so the
	content reflows smoothly, while a fixed panel slides to left:-{width}. The
	panel keeps its width throughout, so its contents never reflow mid-animation.
-->
<div class="bg-background flex min-h-screen w-full">
	{#if sidebar.mobileOpen}
		<button
			type="button"
			aria-label="Close navigation"
			class="fixed inset-0 z-40 bg-black/50 md:hidden"
			onclick={() => sidebar.closeMobile()}
		></button>
	{/if}

	<div
		class="relative hidden shrink-0 bg-transparent md:block {sidebar.dragging
			? ''
			: 'transition-[width] duration-200 ease-linear'} {sidebar.collapsed
			? 'w-0'
			: 'w-(--sidebar-width)'}"
	></div>

	<aside
		class="bg-card fixed inset-y-0 z-50 flex h-svh w-(--sidebar-width) flex-col border-r md:z-20 {sidebar.dragging
			? ''
			: 'transition-[left] duration-200 ease-linear'} {sidebar.mobileOpen
			? 'left-0'
			: 'left-[calc(var(--sidebar-width)*-1)]'} {sidebar.collapsed
			? 'md:left-[calc(var(--sidebar-width)*-1)]'
			: 'md:left-0'}"
	>
		<div class="flex h-[4.25rem] shrink-0 items-center gap-3 border-b px-5">
			<div
				class="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
			>
				OR
			</div>
			<div class="min-w-0">
				<p class="truncate font-semibold">Organization</p>
				<p class="text-muted-foreground text-xs">Members and access</p>
			</div>
		</div>

		<nav class="flex-1 space-y-6 overflow-y-auto p-4">
			{#each navSections as section (section.title)}
				<div class="space-y-1">
					<p class="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
						{section.title}
					</p>

					{#each section.items as item (item.href)}
						{@const active =
							page.url.pathname === `${base}${item.href}` ||
							page.url.pathname === `${base}${item.href}/`}
						<a
							href="{base}{item.href}"
							class="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm transition-colors {active
								? 'bg-primary text-primary-foreground font-medium'
								: 'hover:bg-accent hover:text-accent-foreground'}"
						>
							<span class="flex min-w-0 items-center gap-3">
								<item.icon class="size-4 shrink-0" />
								<span class="truncate">{item.label}</span>
							</span>
							{#if !item.ready}
								<span
									class="bg-muted text-muted-foreground shrink-0 rounded-full px-1.5 text-[10px]"
								>
									soon
								</span>
							{/if}
						</a>
					{/each}
				</div>
			{/each}
		</nav>

		<!-- WAI-ARIA's window-splitter pattern: a focusable separator carrying
			 aria-valuenow IS a widget. Svelte's a11y lint treats `separator` as
			 always non-interactive and rejects it on a button, so the rule is
			 silenced here rather than the semantics being made wrong. -->
		<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
		<button
			type="button"
			role="separator"
			aria-label="Resize sidebar"
			aria-orientation="vertical"
			aria-valuenow={sidebar.width}
			aria-valuemin={MIN_WIDTH}
			aria-valuemax={MAX_WIDTH}
			tabindex="0"
			onpointerdown={(event) => sidebar.startResize(event)}
			onkeydown={(event) => sidebar.handleResizeKey(event)}
			ondblclick={() => sidebar.resetWidth()}
			class="group absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize touch-none focus:outline-none md:block"
		>
			<span
				class="bg-border group-hover:bg-primary group-focus-visible:bg-primary pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors {sidebar.dragging
					? 'bg-primary'
					: ''}"
			></span>
		</button>
	</aside>

	<div class="flex min-w-0 flex-1 flex-col">
		<div
			class="bg-card/90 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur md:px-8"
		>
			<button
				type="button"
				aria-label="Toggle sidebar"
				title="Toggle sidebar (Ctrl+B)"
				aria-expanded={!sidebar.collapsed}
				class="hover:bg-accent -ms-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md"
				onclick={() => sidebar.toggle()}
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect width="18" height="18" x="3" y="3" rx="2" />
					<path d="M9 3v18" />
				</svg>
			</button>

			<div class="h-5 border-l"></div>

			<span class="text-sm font-medium">Organization</span>

			<!-- The shared segment. Everything to its left belongs to this app. -->
			<ToolbarActions
				{apps}
				{palettes}
				currentAppId="organization"
				user={{ name: 'Olivier Lambert', email: 'o.lambert@nixxis.com' }}
				class="ms-auto"
			/>
		</div>

		{@render children()}
	</div>
</div>
