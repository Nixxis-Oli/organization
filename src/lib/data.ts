// Invented records. This application exists to exercise a third repository
// against the shared toolbar, not to manage anyone real.

export interface AppRight {
	id: string;
	label: string;
	description: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	role: 'Owner' | 'Admin' | 'Member';
	lastSeen: string;
	/** Applications this user may start. */
	apps: string[];
}

export const appRights: AppRight[] = [
	{ id: 'bot-studio', label: 'Bot studio', description: 'Design and publish bots' },
	{ id: 'monitoring', label: 'Monitoring', description: 'Live queues and escalations' },
	{ id: 'organization', label: 'Organization', description: 'Members and settings' },
	{ id: 'reporting', label: 'Reporting', description: 'Scheduled reports' }
];

export const users: User[] = [
	{
		id: 'u1',
		name: 'Olivier Lambert',
		email: 'o.lambert@nixxis.com',
		role: 'Owner',
		lastSeen: 'today',
		apps: ['bot-studio', 'monitoring', 'organization', 'reporting']
	},
	{
		id: 'u2',
		name: 'Marine Declercq',
		email: 'm.declercq@nixxis.com',
		role: 'Admin',
		lastSeen: 'today',
		apps: ['bot-studio', 'monitoring', 'reporting']
	},
	{
		id: 'u3',
		name: 'Tomas Veld',
		email: 't.veld@nixxis.com',
		role: 'Member',
		lastSeen: '2 days ago',
		apps: ['monitoring']
	},
	{
		id: 'u4',
		name: 'Amina Cherif',
		email: 'a.cherif@nixxis.com',
		role: 'Member',
		lastSeen: '2 days ago',
		apps: ['bot-studio']
	},
	{
		id: 'u5',
		name: 'Pieter Janssens',
		email: 'p.janssens@nixxis.com',
		role: 'Member',
		lastSeen: 'last week',
		apps: ['monitoring', 'reporting']
	},
	{
		id: 'u6',
		name: 'Sofia Rinaldi',
		email: 's.rinaldi@nixxis.com',
		role: 'Admin',
		lastSeen: 'last week',
		apps: ['bot-studio', 'monitoring', 'organization']
	}
];

export const organization = {
	name: "Nixxis",
	slug: 'nixxis',
	timezone: 'Europe/Brussels',
	locale: 'en-GB',
	retentionDays: 90,
	requireSso: true,
	allowSelfSignup: false
};
