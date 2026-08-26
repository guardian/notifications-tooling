import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'drizzle-kit';
import { getEnvConnectionString } from './runtime-connection-string';

// Drizzle Kit tooling is often launched via `bun x`, which does not forward
// Bun's `--env-file` variables to the spawned process. Load the root env files
// here so migration commands always see the local DB_* configuration. Later
// files win, matching Bun's `.env` < `.env.local` precedence.
const repoRoot = join(
	dirname(fileURLToPath(import.meta.url)),
	'..',
	'..',
	'..',
);
for (const envFile of ['.env', '.env.local']) {
	const envPath = join(repoRoot, envFile);
	if (existsSync(envPath)) {
		process.loadEnvFile(envPath);
	}
}

/* eslint-disable-next-line import/no-default-export -- Drizzle Kit requires the configuration to be the default export. */
export default defineConfig({
	out: './migrations',
	schema: './schema/index.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: getEnvConnectionString(),
	},
});
