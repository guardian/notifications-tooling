import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import type { Database } from './client';
import type { NewNotificationDispatch } from './repositories/notification-dispatches-repository';
import type { NewNotification } from './repositories/notifications-repository';
import { getEnvConnectionString } from './runtime-connection-string';
import * as schema from './schema';

/** A minimal, valid notification row (app-push, immediate send). */
export const buildNotification = (): NewNotification => ({
	idempotencyKey: `idem-${crypto.randomUUID()}`,
	kind: 'send',
	sender: 'notifications-tooling-spa/v1',
	createdByEmail: 'editor@guardian.co.uk',
	content: {
		'lead-story': {
			type: 'app-push',
			title: 'Breaking news',
			body: 'Historic global climate deal reached at the COP summit',
			link: 'https://www.theguardian.com/environment/2026/jul/20/climate',
		},
	},
	channels: {
		'app-push': {
			audience: {
				type: 'topic',
				items: [{ type: 'breaking-news', name: 'UK' }],
			},
			compose: { use: 'lead-story' },
		},
	},
});

export const buildDispatch = (
	notificationId: string,
	overrides: Partial<NewNotificationDispatch> = {},
): NewNotificationDispatch => ({
	notificationId,
	channel: 'app-push',
	target: 'breaking-news',
	status: 'success',
	...overrides,
});

/**
 * Connects a pool, brings the schema up idempotently (so the suite is
 * self-contained), and returns the db plus helpers to reset and close it.
 */
export const setupTestDatabase = async () => {
	const pool = new Pool({ connectionString: getEnvConnectionString() });
	const db: Database = drizzle({ client: pool, schema });

	await migrate(db, {
		migrationsFolder: new URL('./migrations', import.meta.url).pathname,
		migrationsSchema: 'drizzle',
		migrationsTable: '__drizzle_migrations',
	});

	return {
		db,
		truncate: async () => {
			await db.execute(
				sql`TRUNCATE TABLE ${schema.notificationDispatches}, ${schema.notifications} RESTART IDENTITY CASCADE`,
			);
		},
		close: () => pool.end(),
	};
};
