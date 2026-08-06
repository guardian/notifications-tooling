import {
	appPushNotificationSegments,
	MAX_APP_PUSH_SEGMENTS,
	MAX_NEWSLETTER_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	newsletterSegments,
	NotificationChannel,
	notificationChannelContentLimits,
	UserPermissions,
} from '@config';
import { type Request, type Response, Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';

/**
 * The per-channel rules the SPA fetches from `GET /v1/channels/constraints` to
 * drive its UI (character counters, segment caps). Keyed by channel under
 * `channels`.
 *
 * Each text field carries all three limits. The SPA drives its counters from
 * `recommended` and `editorialLimit`; `validationCap` is the only one this
 * service enforces, and wiring it to a character counter would erase the
 * editorial guidance the counter exists to show.
 *
 * Derived from the very same config the backend validates incoming
 * `POST /v1/notifications` requests against, so the client-side hints and the
 * server-side rules can never drift apart.
 */
export const channelConstraints = {
	channels: {
		[NotificationChannel.AppPushNotification]: {
			content:
				notificationChannelContentLimits[
					NotificationChannel.AppPushNotification
				],
			// Push delivers a single content item (`compose.use`).
			compose: { minItems: 1, maxItems: 1 },
			// mobile-n10n rejects a push targeting more than `MAX_APP_PUSH_SEGMENTS` topics.
			audience: { maxSegments: MAX_APP_PUSH_SEGMENTS },
		},
		[NotificationChannel.Newsletter]: {
			content: notificationChannelContentLimits[NotificationChannel.Newsletter],
			// Newsletter composes a single content item into an email, with a
			// subject line bounded by the same limits as an item's title.
			compose: {
				minItems: 1,
				maxItems: 1,
				subject:
					notificationChannelContentLimits[NotificationChannel.Newsletter]
						.title,
			},
			// Newsletter targets Braze campaigns (segments) or an ad-hoc list of test
			// email recipients.
			audience: {
				maxSegments: MAX_NEWSLETTER_SEGMENTS,
				maxTestRecipients: MAX_TEST_EMAIL_RECIPIENTS,
			},
		},
	},
} as const;

/** Reduces a segment config record to the public `{ id, label }` pairs. */
const toSegmentOptions = (
	segments: Record<string, { label: string }>,
): Array<{ id: string; label: string }> =>
	Object.entries(segments).map(([id, { label }]) => ({ id, label }));

/**
 * The selectable audience segments per channel the SPA fetches from
 * `GET /v1/channels/audiences` to populate its audience pickers. Keyed by
 * channel, each exposing a `segments` list. Only the public segment id and
 * human label are exposed; the downstream addressing (Braze campaign /
 * mobile-n10n topic) each id resolves to is kept server-side.
 */
export const channelAudiences = {
	channels: {
		[NotificationChannel.AppPushNotification]: {
			segments: toSegmentOptions(appPushNotificationSegments),
		},
		[NotificationChannel.Newsletter]: {
			segments: toSegmentOptions(newsletterSegments),
		},
	},
} as const;

/**
 * `GET /v1/channels/constraints`. Returns the per-channel validation rules
 * (content length limits, compose shape, audience caps) the SPA uses to drive
 * its UI — character counters and topic limits — so it can warn before the
 * backend rejects a `POST /v1/notifications`.
 *
 * `GET /v1/channels/audiences`. Returns the selectable audience segments
 * (`id` + `label`) per channel the SPA uses to populate its audience pickers.
 */

export const channelsRouter = Router()
	.get(
		'/constraints',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		(_req: Request, res: Response) => {
			res.json(channelConstraints);
		},
	)
	.get(
		'/audiences',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		(_req: Request, res: Response) => {
			res.json(channelAudiences);
		},
	);
