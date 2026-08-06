import { isRunningLocally } from '@config';
import { getSSMParameter } from '@config/ssm';
import { logger } from '@http-logger';
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

const isRunningInLambda = !!process.env.LAMBDA_TASK_ROOT;

const getDbConfig = async () => {
	try {
		const result = await getSSMParameter('db', true);
		const parsed = dbConfigSchema.safeParse(result);

		if (!parsed.success) {
			throw new Error('Could not parse database config from SSM parameter');
		}

		return parsed.data;
	} catch (error) {
		logger.error(
			{ error },
			'Error fetching database config from SSM parameter',
		);
		throw error;
	}
};

const getDbConfigFromEnvironment = (): DBConfigSchema => {
	
	const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;

	if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USERNAME || !DB_PASSWORD) {
		throw new Error(
			'Missing required database environment variables for local development.',
		);
	}

	const parsedDBPort = parseInt(DB_PORT);
	if (isNaN(parsedDBPort)) {
		throw new Error('DB_PORT environment variable must be a valid number.');
	}

	return {
		host: DB_HOST,
		port: parsedDBPort,
		dbname: DB_NAME,
		username: DB_USERNAME,
		password: DB_PASSWORD,
	};
};

export const getConnectionString = async () => {
	const config: DBConfigSchema = isRunningInLambda ? await getDbConfig() : getDbConfigFromEnvironment();

	const { host, port, dbname, username, password } = config;

	return `postgresql://${username}:${password}@${host}:${port}/${dbname}`;
};
