import { z } from 'zod';

const databaseEnvironmentSchema = z.object({
	DB_HOST: z.string().min(1),
	DB_PORT: z.coerce.number().int().positive(),
	DB_NAME: z.string().min(1),
	DB_USERNAME: z.string().min(1),
	DB_PASSWORD: z.string().min(1),
	DB_SSL_MODE: z.enum(['disable', 'require']).optional(),
});

export type DatabaseEnvironment = z.infer<typeof databaseEnvironmentSchema>;

export const loadDatabaseEnvironment = (): DatabaseEnvironment => {
	const parsedEnvironment = databaseEnvironmentSchema.safeParse(process.env);

	if (!parsedEnvironment.success) {
		throw new Error(
			'Missing required database environment variables: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD.',
		);
	}

	return parsedEnvironment.data;
};
