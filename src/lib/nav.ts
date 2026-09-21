import Building from '@lucide/svelte/icons/building-2';
import Settings from '@lucide/svelte/icons/settings';
import Users from '@lucide/svelte/icons/users';
import type { Component } from 'svelte';

export interface NavItem {
	label: string;
	href: string;
	icon: Component;
	ready?: boolean;
}

export interface NavSection {
	title: string;
	items: NavItem[];
}

// Each application owns its navigation; only the toolbar's right-hand end is
// shared. What the three have in common is the treatment, not the entries.
export const navSections: NavSection[] = [
	{
		title: 'Organization',
		items: [
			{ label: 'Overview', href: '/', icon: Building, ready: true },
			{ label: 'Users', href: '/users', icon: Users, ready: true },
			{ label: 'Settings', href: '/settings', icon: Settings, ready: true }
		]
	}
];
