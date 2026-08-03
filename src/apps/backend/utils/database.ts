import { isRunningLocally } from '@config';
import { getSSMParameter } from '@config/ssm';
import postgres from 'postgres';
import { z } from 'zod';

// This schema matches the managed database credentials stored in Secrets Manager
const dbConfigSchema = z.object({
	host: z.string(),
	port: z.number(),
	dbname: z.string(),
	username: z.string(),
	password: z.string(),
});
type DBConfigSchema = z.infer<typeof dbConfigSchema>;

const getLocalDbConfig = (): DBConfigSchema => {
	const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

	if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USERNAME || !DB_PASSWORD) {
		throw new Error(
			'Missing required database environment variables for local development.',
		);
	}

	return {
		host: DB_HOST,
		port: parseInt(DB_PORT),
		dbname: DB_NAME,
		username: DB_USERNAME,
		password: DB_PASSWORD,
	};
};

export async function initialiseDbConnection() {
	const config = isRunningLocally
		? getLocalDbConfig()
		: await getSSMParameter('db', true).then((result) =>
				dbConfigSchema.parse(result),
			);
	const { host, port, dbname, username, password } = config;

	const sql = postgres({
		host,
		port,
		database: dbname,
		user: username,
		password,
		ssl: isRunningLocally ? 'prefer' : 'require',
		idle_timeout: 10,
		max_lifetime: 60 * 15,
	});

	async function closeDbConnection() {
		await sql.end();
	}
	return {
		sql,
		closeDbConnection,
	};
}
