import { z } from 'zod';

export const bodySchema = {
	idempotencyKey: z.string().min(1),
	category: z.string().min(1),
	subject: z.string().min(1),
	description: z.string().min(1),
	imageUrl: z.url().optional(),
	articleUrl: z.url(),
	sender: z.string().min(1),
};
