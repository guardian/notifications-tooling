import { expect, it } from 'bun:test';
import { readFile } from 'node:fs/promises';
import type { ManagedDatabaseSecret } from '../../../../managed-database-secret';
import type { RemoteMigrationConfig } from './cli-args';
import { createRemoteDatabasePool } from './verify-remote-database-connection';

const config: RemoteMigrationConfig = {
	stage: 'CODE',
	localPort: '6544',
	region: 'eu-west-1',
	stackName: 'notifications-CODE-dispatch-stack',
	profile: 'composer',
};

const secret: ManagedDatabaseSecret = {
	host: 'dispatch.example.eu-west-1.rds.amazonaws.com',
	port: 5432,
	dbname: 'dispatchdb',
	username: 'test-user',
	password: 'test-password',
};

it('trusts the repository CA bundle and verifies the RDS hostname', async () => {
	const pool = await createRemoteDatabasePool(config, secret);

	try {
		const ca = await readFile(
			new URL('../../../../certificates/eu-west-1-bundle.pem', import.meta.url),
			'utf8',
		);

		expect(pool.options.ssl).toEqual({
			ca,
			rejectUnauthorized: true,
			servername: secret.host,
		});
	} finally {
		await pool.end();
	}
});

it('connects through the configured local tunnel using database credentials', async () => {
	const pool = await createRemoteDatabasePool(config, secret);

	try {
		expect(pool.options).toMatchObject({
			host: '127.0.0.1',
			port: 6544,
			database: secret.dbname,
			user: secret.username,
			password: secret.password,
		});
	} finally {
		await pool.end();
	}
});
