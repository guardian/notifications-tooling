#!/usr/bin/env bun
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { parseArgs } from './helpers/cli-args';
import {
	createRemoteDatabasePool,
	getDatabaseSecret,
	verifyRemoteDatabaseConnection,
} from './helpers/verify-remote-database-connection';

export {};

const databasePackageDir = new URL('../../../', import.meta.url).pathname;
const usage = `Usage: bun run db:migration:remote-apply --stage <CODE|PROD> [--local-port <port>]\n\nExample:\n  bun run db:migration:remote-apply --stage CODE\n`;

const config = parseArgs(usage);
const secret = getDatabaseSecret(config);

console.log(
	`Applying migrations to ${config.stage} through localhost:${config.localPort}`,
);

const tunnelProcess = Bun.spawn({
	cmd: [
		'bun',
		'run',
		'scripts/open-db-migration-tunnel.ts',
		'--stage',
		config.stage,
		'--local-port',
		config.localPort,
	],
	cwd: databasePackageDir,
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit',
	env: process.env,
});

let exitCode = 1;
let pool;

try {
	console.log('Creating database connection pool...');
	pool = createRemoteDatabasePool(config, secret);

	console.log('Checking remote database connectivity...');
	await verifyRemoteDatabaseConnection(config, pool);

	const db = drizzle({ client: pool });
	const migrationsFolder = new URL('../../../migrations', import.meta.url)
		.pathname;

	console.log(`Applying migrations from ${migrationsFolder}`);

	await migrate(db, {
		migrationsFolder,
		migrationsSchema: 'drizzle',
		migrationsTable: '__drizzle_migrations',
	});

	console.log('Migrations applied successfully.');
	exitCode = 0;
} finally {
	await pool?.end();
	tunnelProcess.kill();
	await tunnelProcess.exited.catch(() => undefined);
}

process.exit(exitCode);
