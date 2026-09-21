import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client, Pool } from 'pg';
import type { Database } from './client';
import { loadDatabaseEnvironment } from './database-environment';
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
				items: [{ type: 'breaking-news', name: 'uk' }],
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
	requested: {
		channel: 'app-push',
		topicType: 'breaking-news',
		editions: ['uk'],
	},
	resolved: {
		channel: 'app-push',
		topics: [{ type: 'breaking', name: 'uk' }],
		importance: 'Major',
	},
	status: 'success',
	...overrides,
});

const useTestDatabase = async (): Promise<void> => {
	const databaseEnvironment = loadDatabaseEnvironment();
	const testDatabaseName =
		process.env.DB_TEST_NAME ??
		(databaseEnvironment.DB_NAME.endsWith('_test')
			? databaseEnvironment.DB_NAME
			: `${databaseEnvironment.DB_NAME}_test`);

	if (!testDatabaseName.endsWith('_test')) {
		throw new Error('DB_TEST_NAME must end with _test.');
	}

	const client = new Client({
		host: databaseEnvironment.DB_HOST,
		port: databaseEnvironment.DB_PORT,
		database: databaseEnvironment.DB_NAME,
		user: databaseEnvironment.DB_USERNAME,
		password: databaseEnvironment.DB_PASSWORD,
	});

	await client.connect();

	try {
		await client.query('select pg_advisory_lock(hashtext($1))', [
			`create-database:${testDatabaseName}`,
		]);

		const existingDatabase = await client.query(
			'select 1 from pg_database where datname = $1',
			[testDatabaseName],
		);

		if (existingDatabase.rowCount === 0) {
			const escapedDatabaseName = testDatabaseName.replaceAll('"', '""');
			await client.query(`create database "${escapedDatabaseName}"`);
		}
	} finally {
		await client.end();
	}

	process.env.DB_NAME = testDatabaseName;
};

/**
 * Connects a pool, brings the schema up idempotently (so the suite is
 * self-contained), and returns the db plus helpers to reset and close it.
 */
export const setupTestDatabase = async () => {
	await useTestDatabase();

	const { DB_NAME } = loadDatabaseEnvironment();
	if (!DB_NAME.endsWith('_test')) {
		throw new Error(
			`Refusing to run destructive database tests against '${DB_NAME}'. Test database names must end with _test.`,
		);
	}

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
