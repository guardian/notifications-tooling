import {
	MAX_PUSH_TOPICS,
	NewsletterLayout,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import { type Request, type Response, Router } from 'express';

/**
 * The per-channel validation rules the SPA fetches from
 * `GET /v1/channels/constraints` to drive its UI (character counters, layout
 * pickers, topic limits).
 *
 * These are derived from the very same config the backend validates incoming
 * `POST /v1/notifications` requests against, so the client-side hints and the
 * server-side rules can never drift apart.
 */
export const channelConstraints = {
	[NotificationChannel.AppPushNotification]: {
		content:
			notificationChannelContentLimits[NotificationChannel.AppPushNotification],
		// Push delivers a single content item (`compose.use`).
		compose: { maxItems: 1 },
		// mobile-n10n rejects a push targeting more than `MAX_PUSH_TOPICS` topics.
		audience: { maxTopics: MAX_PUSH_TOPICS },
	},
	[NotificationChannel.Newsletter]: {
		content: notificationChannelContentLimits[NotificationChannel.Newsletter],
		// Newsletter assembles many items into one of the supported layouts, with
		// a subject line bounded by the same limit as its title.
		compose: {
			layouts: Object.values(NewsletterLayout),
			subject: {
				maxLength:
					notificationChannelContentLimits[NotificationChannel.Newsletter].title
						.maxLength,
			},
		},
	},
} as const;

/**
 * `GET /v1/channels/constraints`. Returns the per-channel validation rules
 * (content length limits, compose shape, audience caps) the SPA uses to drive
 * its UI — character counters, layout pickers and topic limits — so it can warn
 * before the backend rejects a `POST /v1/notifications`.
 */

export const channelsRouter = Router().get(
	'/constraints',
	(_req: Request, res: Response) => {
		res.json(channelConstraints);
	},
);
