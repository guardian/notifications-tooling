import { z } from 'zod';

const localDbEnvironmentSchema = z.object({
	DB_HOST: z.string().min(1),
	DB_PORT: z.coerce.number().int().positive(),
	DB_NAME: z.string().min(1),
	DB_USERNAME: z.string().min(1),
	DB_PASSWORD: z.string().min(1),
});

export const getEnvConnectionString = (): string => {
	const parsedEnvironment = localDbEnvironmentSchema.safeParse(process.env);

	if (!parsedEnvironment.success) {
		throw new Error(
			'Missing required database environment variables: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD.',
		);
	}

	const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD } =
		parsedEnvironment.data;

	return `postgresql://${encodeURIComponent(DB_USERNAME)}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${encodeURIComponent(DB_NAME)}`;
};
