/**
 * Database migration runner for Dispatch.
 *
 * This script runs inside a Fargate task triggered by the Riff-Raff artifact landing in S3.
 * It:
 *   1. Downloads the migration artifact zip from S3.
 *   2. Extracts the zip (Drizzle migration SQL files + drizzle.config.mjs + node_modules).
 *   3. Acquires a PostgreSQL advisory lock to serialise concurrent migration attempts.
 *   4. Runs `drizzle-kit migrate` against the database.
 *   5. Releases the advisory lock.
 *
 * CONCURRENCY NOTE: The advisory lock (pg_advisory_lock) prevents two tasks from running
 * migrations simultaneously. Drizzle's own migration table (_drizzle_migrations) also tracks
 * applied migrations, so a concurrent task that acquires the lock second will see all migrations
 * already applied and exit cleanly. If the lock cannot be acquired within the task timeout, the
 * task will fail visibly in CloudWatch Logs.
 *
 * ASYNC ORDERING NOTE: This task is triggered by the S3 upload of the migration artifact. The
 * S3 upload is ordered after CloudFormation in Riff-Raff, but the ECS task runs asynchronously.
 * The application Lambda deployment is NOT blocked on this task completing. Use expand/contract
 * (backward-compatible) migrations to ensure the running Lambda is safe before and after a deploy.
 *
 * Required environment variables (injected as ECS secrets from Secrets Manager):
 *   DB_HOST, DB_USERNAME, DB_PASSWORD
 *
 * Required plaintext environment variables (set by CDK, not sensitive):
 *   ARTIFACT_BUCKET, ARTIFACT_KEY
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import pg from 'pg';
import { execFile } from 'node:child_process';
import { createWriteStream, mkdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';

const { Client } = pg;
const execFileAsync = promisify(execFile);

const ARTIFACT_BUCKET = process.env.ARTIFACT_BUCKET;
const ARTIFACT_KEY = process.env.ARTIFACT_KEY;
const DB_HOST = process.env.DB_HOST;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = 'dispatchdb';
const DB_PORT = 5432;
const REGION = process.env.AWS_REGION ?? 'eu-west-1';

// A stable numeric lock ID derived from the string 'dispatch-database-migrations'.
// Must be a 32-bit integer for pg_advisory_lock.
const MIGRATION_ADVISORY_LOCK_ID = 74618_49;

for (const [name, value] of Object.entries({
	ARTIFACT_BUCKET,
	ARTIFACT_KEY,
	DB_HOST,
	DB_USERNAME,
	DB_PASSWORD,
})) {
	if (!value) {
		console.error(`Missing required environment variable: ${name}`);
		process.exit(1);
	}
}

const WORK_DIR = '/tmp/dispatch-migrations';
const ZIP_PATH = '/tmp/dispatch-migrations.zip';

// Step 1: Download the migration artifact from S3.
console.log(
	`Downloading migration artifact s3://${ARTIFACT_BUCKET}/${ARTIFACT_KEY}`,
);
const s3 = new S3Client({ region: REGION });
const s3Response = await s3.send(
	new GetObjectCommand({ Bucket: ARTIFACT_BUCKET, Key: ARTIFACT_KEY }),
);
mkdirSync(WORK_DIR, { recursive: true });
await pipeline(s3Response.Body, createWriteStream(ZIP_PATH));
console.log('Artifact downloaded.');

// Step 2: Extract the artifact.
console.log('Extracting migration artifact...');
await execFileAsync('unzip', ['-q', '-o', ZIP_PATH, '-d', WORK_DIR]);
console.log('Artifact extracted.');

// Step 3: Acquire a PostgreSQL advisory lock and run migrations.
const databaseUrl = `postgres://${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const client = new Client({ connectionString: databaseUrl });

await client.connect();
console.log('Connected to database.');

try {
	console.log('Acquiring migration advisory lock...');
	await client.query('SELECT pg_advisory_lock($1)', [
		MIGRATION_ADVISORY_LOCK_ID,
	]);
	console.log('Advisory lock acquired.');

	// Step 4: Run drizzle-kit migrate using the pre-installed binaries from the artifact.
	console.log('Running database migrations...');
	const { stdout, stderr } = await execFileAsync(
		'node',
		['node_modules/.bin/drizzle-kit', 'migrate', '--config=drizzle.config.mjs'],
		{
			cwd: WORK_DIR,
			env: { ...process.env, DATABASE_URL: databaseUrl },
		},
	);
	if (stdout) console.log(stdout);
	if (stderr) console.error(stderr);
	console.log('Database migrations completed successfully.');
} finally {
	// Step 5: Always release the advisory lock.
	try {
		await client.query('SELECT pg_advisory_unlock($1)', [
			MIGRATION_ADVISORY_LOCK_ID,
		]);
		console.log('Advisory lock released.');
	} catch (unlockErr) {
		console.error('Failed to release advisory lock:', unlockErr);
	}
	await client.end();
}
