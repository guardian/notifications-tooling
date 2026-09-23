import z from 'zod';

const articlePreviousSendSchema = z.object({
	notificationId: z.string(),
	sentBy: z.string(),
	sentAt: z.string(),
	channels: z.string().array(),
});
export type ArticlePreviousSend = z.infer<typeof articlePreviousSendSchema>;

export const articlePreviousSendsResponseSchema = z.object({
	articleId: z.string(),
	total: z.number(),
	limit: z.number().optional(),
	offset: z.number().optional(),
	sends: articlePreviousSendSchema.array(),
});

export type ArticlePreviousSendsResponse = z.infer<
	typeof articlePreviousSendsResponseSchema
>;
