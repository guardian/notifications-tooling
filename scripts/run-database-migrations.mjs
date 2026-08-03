import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
// eslint-disable-next-line import/no-unresolved -- Installed into the deployment artifact by the builder.
import pg from 'pg';

const { Client } = pg;
const execFileAsync = promisify(execFile);

const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = 'dispatchdb';
const DB_PORT = 5432;
const MIGRATION_ADVISORY_LOCK_ID = 74618_49;

for (const [name, value] of Object.entries({
	DB_HOST,
	DB_USERNAME,
	DB_PASSWORD,
})) {
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
}

const databaseUrl = `postgres://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const client = new Client({ connectionString: databaseUrl });

await client.connect();
console.log('Connected to database.');

try {
	console.log('Acquiring migration advisory lock...');
	await client.query('SELECT pg_advisory_lock($1)', [
		MIGRATION_ADVISORY_LOCK_ID,
	]);
	console.log('Advisory lock acquired.');

	console.log('Running database migrations...');
	const { stdout, stderr } = await execFileAsync(
		'node',
		['node_modules/.bin/drizzle-kit', 'migrate', '--config=drizzle.config.mjs'],
		{
			env: { ...process.env, DATABASE_URL: databaseUrl },
		},
	);
	if (stdout) {
		console.log(stdout);
	}
	if (stderr) {
		console.error(stderr);
	}
	console.log('Database migrations completed successfully.');
} finally {
	try {
		await client.query('SELECT pg_advisory_unlock($1)', [
			MIGRATION_ADVISORY_LOCK_ID,
		]);
		console.log('Advisory lock released.');
	} catch (error) {
		console.error('Failed to release advisory lock:', error);
	}
	await client.end();
}
