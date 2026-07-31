import { defineConfig } from 'drizzle-kit';

/* eslint-disable-next-line import/no-default-export -- Drizzle Kit requires the configuration to be the default export. */
export default defineConfig({
	out: './migrations',
	schema: './schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
