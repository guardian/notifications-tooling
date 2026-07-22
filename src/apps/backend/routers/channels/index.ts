import {
	MAX_APP_PUSH_SEGMENTS,
	MAX_NEWSLETTER_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import { type Request, type Response, Router } from 'express';

/**
 * The per-channel validation rules the SPA fetches from
 * `GET /v1/channels/constraints` to drive its UI (character counters, topic
 * limits). Keyed by channel under `channels`.
 *
 * These are derived from the very same config the backend validates incoming
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
			// Newsletter assembles one or more content items into a single email,
			// with a subject line bounded by the same limit as an item's title.
			compose: {
				minItems: 1,
				subject: {
					maxLength:
						notificationChannelContentLimits[NotificationChannel.Newsletter]
							.title.maxLength,
				},
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

/**
 * `GET /v1/channels/constraints`. Returns the per-channel validation rules
 * (content length limits, compose shape, audience caps) the SPA uses to drive
 * its UI — character counters and topic limits — so it can warn before the
 * backend rejects a `POST /v1/notifications`.
 */

export const channelsRouter = Router().get(
	'/constraints',
	(_req: Request, res: Response) => {
		res.json(channelConstraints);
	},
);
