import { z } from 'zod';

const defaultLimit = 10;
const defaultOffset = 0;
const defaultSinceDays = 14;

const daysAgo = (days: number) =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000);

/** Validates a Unix timestamp (seconds) and decodes it to a `Date`. */
const epochSecondsToDate = z.codec(z.coerce.number().int().min(0), z.date(), {
	decode: (seconds) => new Date(seconds * 1000),
	encode: (date) => Math.floor(date.getTime() / 1000),
});

/**
 * Query for `GET /v1/notifications`. Values arrive as strings, so all params
 * are coerced. `since` is a Unix timestamp (seconds) acting as the cut-off —
 * only notifications created at or after it are returned. When omitted it
 * defaults to 14 days ago. `limit` and `offset` are all-or-nothing: supply both
 * or neither. When omitted they default to limit 10 / offset 0. An `offset` past
 * the end of the range yields an empty page — `total` still reports the full
 * count at or after `since`.
 */
export const notificationListQuerySchema = z
	.strictObject({
		since: epochSecondsToDate.optional(),
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
		since: query.since ?? daysAgo(defaultSinceDays),
		limit: query.limit ?? defaultLimit,
		offset: query.offset ?? defaultOffset,
	}));

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
