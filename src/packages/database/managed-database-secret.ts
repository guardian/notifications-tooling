import { z } from 'zod';

export const managedDatabaseSecretSchema = z.object({
	host: z.string().min(1),
	port: z.number().int().positive(),
	dbname: z.string().min(1),
	username: z.string().min(1),
	password: z.string().min(1),
});

export type ManagedDatabaseSecret = z.infer<typeof managedDatabaseSecretSchema>;

export const parseManagedDatabaseSecret = (
	value: unknown,
): ManagedDatabaseSecret => managedDatabaseSecretSchema.parse(value);
