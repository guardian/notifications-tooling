import { determineArticleId } from '@utils';
import { z } from 'zod';

const defaultLimit = 50;
const defaultOffset = 0;

export const notificationArticleHistoryParamsSchema = z
	.strictObject({
		articleId: z.string().trim().min(1).max(500),
	})
	.refine(({ articleId }) => determineArticleId(articleId) === articleId, {
		message: 'The articleId must be a valid CAPI article ID.',
		path: ['articleId'],
	});

export const notificationArticleHistoryQuerySchema = z
	.strictObject({
		limit: z.coerce.number().int().min(1).max(100).optional(),
		offset: z.coerce.number().int().min(0).optional(),
	})
	.transform((query) => ({
		limit: query.limit ?? defaultLimit,
		offset: query.offset ?? defaultOffset,
	}));

export type NotificationArticleHistoryParams = z.infer<
	typeof notificationArticleHistoryParamsSchema
>;

export type NotificationArticleHistoryQuery = z.infer<
	typeof notificationArticleHistoryQuerySchema
>;
