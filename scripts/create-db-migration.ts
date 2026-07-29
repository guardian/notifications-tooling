#!/usr/bin/env bun

const printUsage = (): void => {
	console.error('Usage: bun run db:migration:create <migration-name>');
	console.error('Example: bun run db:migration:create add_notification_status');
};

const rawArgs = process.argv.slice(2);
const helpRequested = rawArgs.includes('--help') || rawArgs.includes('-h');

if (helpRequested) {
	printUsage();
	process.exit(0);
}

const migrationName = rawArgs[0];

if (!migrationName) {
	printUsage();
	process.exit(1);
}

const migrationNamePattern = /^[a-z0-9_]+$/;

if (!migrationNamePattern.test(migrationName)) {
	console.error(
		'Migration names may only contain lowercase letters, numbers and underscores.',
	);
	process.exit(1);
}

const passthroughArgs = rawArgs.slice(1);
const drizzleProcess = Bun.spawnSync(
	[
		'bun',
		'--bun',
		'x',
		'drizzle-kit',
		'generate',
		'--config=drizzle.config.ts',
		`--name=${migrationName}`,
		...passthroughArgs,
	],
	{
		stdout: 'inherit',
		stderr: 'inherit',
		stdin: 'inherit',
		env: process.env,
	},
);

if (drizzleProcess.exitCode !== 0) {
	process.exit(drizzleProcess.exitCode);
}
