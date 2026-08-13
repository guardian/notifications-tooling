// Remote database access helpers for parsing secrets, probing connectivity, and shaping migration env.

import { Client, Pool } from 'pg';
import type { ManagedDatabaseSecret } from '../../../../managed-database-secret';
import { parseManagedDatabaseSecret } from '../../../../managed-database-secret';
import { getDatabaseSecretString } from './aws';
import type { Config } from './cli-args';

const remoteSslConfig = {
	rejectUnauthorized: false,
};

export const getDatabaseSecret = (config: Config): ManagedDatabaseSecret => {
	const secretString = getDatabaseSecretString(config);

	return parseManagedDatabaseSecret(JSON.parse(secretString));
};

const createRemoteDatabaseClient = (
	config: Config,
	secret: ManagedDatabaseSecret,
) =>
	new Client({
		host: '127.0.0.1',
		port: Number(config.localPort),
		database: secret.dbname,
		user: secret.username,
		password: secret.password,
		ssl: remoteSslConfig,
	});

export const createRemoteDatabasePool = (
	config: Config,
	secret: ManagedDatabaseSecret,
) =>
	new Pool({
		host: '127.0.0.1',
		port: Number(config.localPort),
		database: secret.dbname,
		user: secret.username,
		password: secret.password,
		ssl: remoteSslConfig,
	});

export const prepareRemoteDatabase = async (
	config: Config,
	secret: ManagedDatabaseSecret,
) => {
	const client = createRemoteDatabaseClient(config, secret);

	try {
		await client.connect();
		const result = await client.query<{
			current_database: string;
			current_user: string;
		}>('select current_database(), current_user');
		const row = result.rows[0];

		if (!row) {
			throw new Error('Connection probe returned no rows.');
		}

		console.log(
			`Connected to ${row.current_database} as ${row.current_user} through localhost:${config.localPort}`,
		);

		await client.query('create schema if not exists drizzle');
		console.log('Ensured drizzle schema exists for migration bookkeeping.');
	} catch (error) {
		console.error(
			'Remote database preflight failed before running migrations.',
		);
		console.error(error);
		throw error;
	} finally {
		await client.end().catch(() => undefined);
	}
};
