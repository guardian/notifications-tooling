#!/usr/bin/env bun
import { createConnection } from 'node:net';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { parseArgs } from './helpers/cli-args';
import {
	createRemoteDatabasePool,
	getDatabaseSecret,
	prepareRemoteDatabase,
} from './helpers/remote-db-access-setup';

export {};

const databasePackageDir = new URL('../', import.meta.url).pathname;
const usage = `Usage: bun run db:migration:remote-apply --stage <CODE|PROD> [--local-port <port>]\n\nExample:\n  bun run db:migration:remote-apply --stage CODE\n`;

const wait = (milliseconds: number) =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitForLocalPort = async (localPort: string, timeoutMs = 15000) => {
	const port = Number(localPort);

	if (!Number.isInteger(port) || port <= 0) {
		throw new Error(`Invalid local port: ${localPort}`);
	}

	const deadline = Date.now() + timeoutMs;

	while (Date.now() < deadline) {
		const isReachable = await new Promise<boolean>((resolve) => {
			const socket = createConnection({ host: '127.0.0.1', port });

			socket.once('connect', () => {
				socket.end();
				resolve(true);
			});

			socket.once('error', () => {
				socket.destroy();
				resolve(false);
			});
		});

		if (isReachable) {
			return;
		}

		await wait(250);
	}

	throw new Error(
		`Timed out waiting for the migration tunnel on localhost:${localPort}.`,
	);
};

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

try {
	await waitForLocalPort(config.localPort);
	console.log('Using SSL for the remote database connection.');
	await prepareRemoteDatabase(config, secret);
	console.log('Running programmatic Drizzle migrations...');
	const pool = createRemoteDatabasePool(config, secret);

	try {
		const db = drizzle({ client: pool });
		const migrationsFolder = new URL('../migrations', import.meta.url).pathname;

		console.log(`Applying migrations from ${migrationsFolder}`);

		await migrate(db, {
			migrationsFolder,
			migrationsSchema: 'drizzle',
			migrationsTable: '__drizzle_migrations',
		});

		console.log('Migrations applied successfully.');
		exitCode = 0;
	} finally {
		await pool.end();
	}
} finally {
	tunnelProcess.kill();
	await tunnelProcess.exited.catch(() => undefined);
}

process.exit(exitCode);
