import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const getConnectionString = () => {
	const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

	if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USERNAME || !DB_PASSWORD) {
		throw new Error(
			'Missing required database environment variables for local development.',
		);
	}

	return `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

const connectionString = getConnectionString();

if (!connectionString) {
	throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
	connectionString,
});

export const db = drizzle({ client: pool });
export { connectionString, pool };
