import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

const configDir = dirname(fileURLToPath(import.meta.url));

loadDotenv({ path: join(configDir, '.env') });

/* eslint-disable-next-line import/no-default-export -- Drizzle Kit requires the configuration to be the default export. */
export default defineConfig({
	out: './db/migrations',
	schema: './db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
