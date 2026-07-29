import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/* eslint-disable-next-line import/no-default-export -- Drizzle Kit requires the configuration to be the default export. */
export default defineConfig({
	out: './src/apps/backend/db/migrations',
	schema: './src/apps/backend/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
