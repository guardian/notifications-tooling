import { defineConfig } from 'drizzle-kit';
import { getEnvConnectionString } from './runtime-connection-string';

/* eslint-disable-next-line import/no-default-export -- Drizzle Kit requires the configuration to be the default export. */
export default defineConfig({
	out: './migrations',
	schema: './schema/index.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: getEnvConnectionString(),
	},
});
