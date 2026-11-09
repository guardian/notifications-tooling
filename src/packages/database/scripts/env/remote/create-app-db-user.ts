#!/usr/bin/env bun
// Creates the restricted Postgres user the application uses at runtime.
// Logs in as the admin user from the `db` secret and reads the app user's
// credentials from the `app-db` secret. Fails if the user already exists.
import { escapeIdentifier, escapeLiteral } from 'pg';
import { parseManagedDatabaseSecret } from '../../../managed-database-secret';
import { spawnCommand } from '../../helpers/process';
import { getDatabaseSecretString } from './helpers/aws';
import { parseArgs } from './helpers/cli-args';
import {
	createRemoteDatabasePool,
	getDatabaseSecret,
	verifyRemoteDatabaseConnection,
} from './helpers/verify-remote-database-connection';

const usage = `Usage: bun run db:app-user:create --stage <CODE|PROD> [--local-port <port>]\n`;

const config = parseArgs(usage);
const adminSecret = getDatabaseSecret(config);
const appSecret = parseManagedDatabaseSecret(
	JSON.parse(getDatabaseSecretString(config, 'app-db')),
);

const user = escapeIdentifier(appSecret.username);
const password = escapeLiteral(appSecret.password);

const tunnelProcess = spawnCommand({
	cmd: [
		'bun',
		'run',
		'scripts/env/remote/start-remote-db-port-forward.ts',
		'--stage',
		config.stage,
		'--local-port',
		config.localPort,
	],
	cwd: new URL('../../../', import.meta.url).pathname,
});

const pool = createRemoteDatabasePool(config, adminSecret);

try {
	await verifyRemoteDatabaseConnection(config, pool);

	const { rowCount } = await pool.query(
		'SELECT 1 FROM pg_roles WHERE rolname = $1',
		[appSecret.username],
	);

	if (rowCount !== 0) {
		throw new Error(
			`User ${appSecret.username} already exists on ${config.stage}; nothing was changed.`,
		);
	}

	// New roles have no admin attributes (superuser, createdb, createrole, ...) by default.
	const statements = [
		`CREATE ROLE ${user} LOGIN PASSWORD ${password}`,
		`GRANT CONNECT ON DATABASE ${escapeIdentifier(appSecret.dbname)} TO ${user}`,
		`GRANT USAGE ON SCHEMA public TO ${user}`,
		`GRANT SELECT, INSERT, UPDATE ON TABLE public.notifications, public.notification_dispatches TO ${user}`,
	];

	await pool.query(['BEGIN', ...statements, 'COMMIT'].join(';\n'));

	console.log(`${appSecret.username} is set up on ${config.stage}.`);
} finally {
	await pool.end();
	tunnelProcess.kill();
	await tunnelProcess.exited.catch(() => undefined);
}
