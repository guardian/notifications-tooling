import { getManagedConfigValue } from '@config/ssm';
import { logger } from '@http-logger';
import { z } from 'zod';
import { getEnvConnectionString } from './env-connection-string';

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

const getLambdaDbConfig = async () => {
	try {
		const result = await getManagedConfigValue('db', 'secretsManager');
		const parsed = dbConfigSchema.safeParse(result);

		if (!parsed.success) {
			throw new Error(
				'Could not parse database config from Secrets Manager secret',
			);
		}

		return parsed.data;
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

	const config: DBConfigSchema = await getLambdaDbConfig();

	const { host, port, dbname, username, password } = config;

	return `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(dbname)}`;
};
