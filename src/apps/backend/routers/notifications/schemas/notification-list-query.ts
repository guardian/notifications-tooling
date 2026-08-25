import { z } from 'zod';

const defaultLimit = 10;
const defaultOffset = 0;

/**
 * Pagination for `GET /v1/notifications`. Query values arrive as strings, so
 * both params are coerced. `limit` and `offset` are all-or-nothing: supply both
 * or neither. When omitted they default to limit 10 / offset 0. An `offset`
 * past the end of the window yields an empty page — `total` still reports the
 * full 14-day count.
 */
export const notificationListQuerySchema = z
	.strictObject({
		limit: z.coerce.number().int().min(1).max(50).optional(),
		offset: z.coerce.number().int().min(0).optional(),
	})
	.refine(
		(query) => (query.limit === undefined) === (query.offset === undefined),
		{
			message: 'limit and offset must be provided together, or both omitted.',
			path: ['limit'],
		},
	)
	.transform((query) => ({
		limit: query.limit ?? defaultLimit,
		offset: query.offset ?? defaultOffset,
	}));

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
