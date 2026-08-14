import { getSecretValue } from '@config/ssm';
import { logger } from '@http-logger';
import { loadDatabaseEnvironment } from './database-environment';
import { parseManagedDatabaseSecret } from './managed-database-secret';

const isRunningInLambda = !!process.env.LAMBDA_TASK_ROOT;

export const getEnvConnectionString = (): string => {
	const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_SSL_MODE } =
		loadDatabaseEnvironment();
	const query = DB_SSL_MODE ? `?sslmode=${DB_SSL_MODE}` : '';

	return `postgresql://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${encodeURIComponent(DB_NAME)}${query}`;
};

const getLambdaDbConfig = async () => {
	try {
		return await getSecretValue('db', parseManagedDatabaseSecret);
	} catch (error) {
		logger.error(
			{ error },
			'Error fetching database config from Secrets Manager secret',
		);

		throw error;
	}
};

export const getRuntimeConnectionString = async () => {
	if (!isRunningInLambda) {
		return getEnvConnectionString();
	}

	const config = await getLambdaDbConfig();

	const { host, port, dbname, username, password } = config;

	return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(dbname)}`;
};
