import {
	canonicalHistoryAlertTypes,
	historyAlertTypeSchema,
	notificationAudienceFilterId,
} from '@models';
import { determineArticleId, isGuardianUrl } from '@utils';
import { z } from 'zod';

const defaultLimit = 10;
const defaultOffset = 0;
const defaultSinceDays = 14;
const notificationStatusCategory = z.enum(['sent', 'error']);

const statusesByCategory = {
	sent: ['accepted', 'delivered'],
	error: ['partially_delivered', 'failed'],
} as const;

const daysAgo = (days: number) =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const articleIdSchema = z
	.string()
	.trim()
	.min(1)
	.max(2048)
	.refine((articleReference) => {
		const articleId = determineArticleId(articleReference);
		return (
			articleId !== undefined &&
			(isGuardianUrl(articleReference) || articleId === articleReference)
		);
	}, 'The articleId must be a valid CAPI article ID or Guardian article URL.')
	.transform((articleReference) => determineArticleId(articleReference)!);

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
 * count at or after `since`. Repeated `createdByEmail` values restrict the page
 * to notifications sent by any selected user, matched case-insensitively.
 */
export const notificationListQuerySchema = z
	.strictObject({
		since: epochSecondsToDate.optional(),
		limit: z.coerce.number().int().min(1).max(50).optional(),
		offset: z.coerce.number().int().min(0).optional(),
		search: z.string().trim().min(1).max(200).optional(),
		articleId: articleIdSchema.optional(),
		createdByEmail: z
			.union([
				z.string().trim().min(1).max(320),
				z.array(z.string().trim().min(1).max(320)).min(1),
			])
			.transform((value) => (Array.isArray(value) ? value : [value]))
			.optional(),
		audience: z
			.union([
				notificationAudienceFilterId,
				z.array(notificationAudienceFilterId).min(1),
			])
			.transform((value) => (Array.isArray(value) ? value : [value]))
			.optional(),
		status: z
			.union([
				notificationStatusCategory,
				z.array(notificationStatusCategory).min(1),
			])
			.transform((value) => (Array.isArray(value) ? value : [value]))
			.optional(),
		alertType: z
			.union([historyAlertTypeSchema, z.array(historyAlertTypeSchema)])
			.transform((value) =>
				canonicalHistoryAlertTypes(Array.isArray(value) ? value : [value]),
			)
			.optional(),
	})
	.refine(
		(query) => (query.limit === undefined) === (query.offset === undefined),
		{
			message: 'limit and offset must be provided together, or both omitted.',
			path: ['limit'],
		},
	)
	.transform((query) => ({
		since:
			query.since ??
			(query.articleId === undefined ? daysAgo(defaultSinceDays) : new Date(0)),
		limit: query.limit ?? defaultLimit,
		offset: query.offset ?? defaultOffset,
		search: query.search,
		articleId: query.articleId,
		createdByEmails: query.createdByEmail
			? [...new Set(query.createdByEmail.map((email) => email.toLowerCase()))]
			: undefined,
		audiences: query.audience ? [...new Set(query.audience)] : undefined,
		statuses: query.status
			? [
					...new Set(
						query.status.flatMap((status) => statusesByCategory[status]),
					),
				]
			: undefined,
		alertTypes: query.alertType,
	}));

export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;

/**
 * Query for `GET /v1/notifications/senders`. `since` is the same optional Unix
 * timestamp (seconds) cut-off as the list endpoint — only senders of
 * notifications created at or after it are returned. When omitted it defaults to
 * 14 days ago.
 */
export const notificationSendersQuerySchema = z
	.strictObject({
		since: epochSecondsToDate.optional(),
	})
	.transform((query) => ({
		since: query.since ?? daysAgo(defaultSinceDays),
	}));

export type NotificationSendersQuery = z.infer<
	typeof notificationSendersQuerySchema
>;
