import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	STAGE: z.enum(['DEV', 'CODE', 'PROD']).default('DEV'),
	STACK: z.string().default('notifications'),
	APP: z.string().default('dispatch'),
	HOST: z.string().default('0.0.0.0'),
	PORT: z.coerce.number().int().positive().default(3000),
	LOG_LEVEL: z
		.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
		.optional(),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;
