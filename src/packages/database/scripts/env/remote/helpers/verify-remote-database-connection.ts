// Remote database access helpers for parsing secrets, probing connectivity, and shaping migration env.
import { readFile } from 'node:fs/promises';
import { Pool } from 'pg';
import type { ManagedDatabaseSecret } from '../../../../managed-database-secret';
import { parseManagedDatabaseSecret } from '../../../../managed-database-secret';
import { getDatabaseSecretString } from './aws';
import type { RemoteMigrationConfig } from './cli-args';

export const getDatabaseSecret = (
	config: RemoteMigrationConfig,
): ManagedDatabaseSecret => {
	const secretString = getDatabaseSecretString(config);

	return parseManagedDatabaseSecret(JSON.parse(secretString));
};

export const createRemoteDatabasePool = async (
	config: RemoteMigrationConfig,
	secret: ManagedDatabaseSecret,
) =>
	new Pool({
		host: '127.0.0.1',
		port: Number(config.localPort),
		database: secret.dbname,
		user: secret.username,
		password: secret.password,
		ssl: {
			ca: await readFile(
				new URL(
					'../../../../certificates/eu-west-1-bundle.pem',
					import.meta.url,
				),
				'utf8',
			),
			rejectUnauthorized: true,
			// TCP goes through localhost, but the certificate identifies the RDS host.
			servername: secret.host,
		},
	});

export const verifyRemoteDatabaseConnection = async (
	config: RemoteMigrationConfig,
	pool: Pool,
) => {
	let client;
	const maxAttempts = 30;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			client = await pool.connect();
			const result = await client.query<{
				current_database: string;
				current_user: string;
			}>('select current_database(), current_user');
			const row = result.rows[0];

			if (!row) {
				throw new Error('Connection returned no rows.');
			}

			console.log(
				`Connected to ${row.current_database} as ${row.current_user} through localhost:${config.localPort}`,
			);

			// Connection successful, exit the function
			return;
		} catch (error) {
			if (attempt === maxAttempts) {
				console.error(
					'Remote database connectivity check failed before running migrations.',
				);
				console.error(error);

				throw error;
			}

			await new Promise((resolve) => setTimeout(resolve, 500));
		} finally {
			client?.release();
		}
	}
};
