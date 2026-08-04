import { z } from 'zod';

const envSchema = z
	.object({
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		STAGE: z.enum(['DEV', 'CODE', 'PROD']).default('DEV'),
		STACK: z.string().default('notifications'),
		APP: z.string().default('dispatch'),
		AWS_PROFILE: z.string().trim().min(1).default('composer'),
		AWS_REGION: z.string().trim().min(1).default('eu-west-1'),
		HOST: z.string().default('0.0.0.0'),
		PORT: z.coerce.number().int().positive().default(3000),
		LOG_LEVEL: z
			.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
			.optional(),
	})
	.readonly();

export const env = envSchema.parse(process.env);

export const localAwsConfig = {
	profile: env.AWS_PROFILE,
	region: env.AWS_REGION,
};

export type Env = z.infer<typeof envSchema>;

export type ConfigurationStage = Exclude<Env['STAGE'], 'DEV'>;

export const configurationStage: ConfigurationStage =
	env.STAGE === 'PROD' ? 'PROD' : 'CODE';
