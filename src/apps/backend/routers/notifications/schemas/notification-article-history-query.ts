import { determineArticleId, isGuardianUrl } from '@utils';
import { z } from 'zod';

const defaultLimit = 50;
const defaultOffset = 0;

export const notificationArticleHistoryQuerySchema = z
	.strictObject({
		articleId: z.string().trim().min(1).max(2048),
		limit: z.coerce.number().int().min(1).max(100).optional(),
		offset: z.coerce.number().int().min(0).optional(),
	})
	.refine(
		({ articleId }) => {
			const resolvedArticleId = determineArticleId(articleId);
			return (
				resolvedArticleId !== undefined &&
				(isGuardianUrl(articleId) || resolvedArticleId === articleId)
			);
		},
		{
			message:
				'The articleId must be a valid CAPI article ID or Guardian article URL.',
			path: ['articleId'],
		},
	)
	.transform(({ articleId, limit, offset }) => ({
		articleId: determineArticleId(articleId)!,
		limit: limit ?? defaultLimit,
		offset: offset ?? defaultOffset,
	}));

export type NotificationArticleHistoryQuery = z.infer<
	typeof notificationArticleHistoryQuerySchema
>;
