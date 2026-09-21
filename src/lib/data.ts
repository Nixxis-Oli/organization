// Invented records. This application exists to exercise a third repository
// against the shared toolbar, not to manage anyone real.

export interface AppRight {
	id: string;
	label: string;
	description: string;
	/** False for an application that is announced but not built yet. */
	ready?: boolean;
}

export interface User {
	id: string;
	name: string;
	email: string;
	/** Exactly one account owns the organization; its rights cannot be removed. */
	owner?: boolean;
	lastSeen: string;
	/** Applications this user may start. */
	apps: string[];
}

export type Role = 'Owner' | 'Admin' | 'Member';

/**
 * The role is not stored: administering the organization IS the Organization
 * application, so the switch in the table is what decides it. One source of
 * truth beats a role column that can disagree with the rights beside it.
 */
export function roleOf(user: User): Role {
	if (user.owner) {
		return 'Owner';
	}

	return user.apps.includes('organization') ? 'Admin' : 'Member';
}

export const appRights: AppRight[] = [
	{ id: 'bot-studio', label: 'Bot studio', description: 'Design and publish bots' },
	{ id: 'monitoring', label: 'Monitoring', description: 'Live queues and escalations' },
	{ id: 'organization', label: 'Organization', description: 'Members and settings' },
	{ id: 'reporting', label: 'Reporting', description: 'Scheduled reports', ready: false }
];

export const users: User[] = [
	{
		id: 'u1',
		name: 'Olivier Lambert',
		email: 'o.lambert@nixxis.com',
		owner: true,
		lastSeen: 'today',
		apps: ['bot-studio', 'monitoring', 'organization', 'reporting']
	},
	{
		id: 'u2',
		name: 'Marine Declercq',
		email: 'm.declercq@nixxis.com',
		lastSeen: 'today',
		apps: ['bot-studio', 'monitoring', 'reporting']
	},
	{
		id: 'u3',
		name: 'Tomas Veld',
		email: 't.veld@nixxis.com',
		lastSeen: '2 days ago',
		apps: ['monitoring']
	},
	{
		id: 'u4',
		name: 'Amina Cherif',
		email: 'a.cherif@nixxis.com',
		lastSeen: '2 days ago',
		apps: ['bot-studio']
	},
	{
		id: 'u5',
		name: 'Pieter Janssens',
		email: 'p.janssens@nixxis.com',
		lastSeen: 'last week',
		apps: ['monitoring', 'reporting']
	},
	{
		id: 'u6',
		name: 'Sofia Rinaldi',
		email: 's.rinaldi@nixxis.com',
		lastSeen: 'last week',
		apps: ['bot-studio', 'monitoring', 'organization']
	}
];

export const organization = {
	name: 'ACME',
	timezone: 'Europe/Brussels',
	locale: 'en-GB',
	retentionDays: 90,
	requireSso: true,
	allowSelfSignup: false
};
