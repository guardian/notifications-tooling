import {
	appPushTopicTypes,
	MAX_APP_PUSH_TOPICS,
	MAX_NEWSLETTER_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	newsletterSegments,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import { UserPermissions } from '@models';
import type { BrazeCampaignDetails } from '@services';
import { type Request, type Response, Router } from 'express';
import { loadBrazeClient } from '../../braze-client';
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
			// mobile-n10n rejects a push targeting more than `MAX_APP_PUSH_TOPICS` topics.
			audience: { maxTopics: MAX_APP_PUSH_TOPICS },
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
 * Reduces the curated app-push topic types to the public `{ id, label }` pairs,
 * each carrying its selectable `editions` (also `{ id, label }`). The
 * mobile-n10n topic coordinates each pair resolves to are kept server-side.
 */
const toTopicTypeOptions = (
	topicTypes: Record<
		string,
		{ label: string; editions: Record<string, { label: string }> }
	>,
): Array<{
	id: string;
	label: string;
	editions: Array<{ id: string; label: string }>;
}> =>
	Object.entries(topicTypes).map(([id, { label, editions }]) => ({
		id,
		label,
		editions: toSegmentOptions(editions),
	}));

/**
 * The selectable audiences per channel the SPA fetches from
 * `GET /v1/channels/audiences` to populate its audience pickers. Keyed by
 * channel: newsletter exposes a `segments` list, while app-push exposes
 * `topicTypes` each with their selectable `editions`. Only public
 * ids and human labels are exposed; the downstream addressing (Braze campaign /
 * mobile-n10n topic) each selection resolves to is kept server-side.
 */
export const channelAudiences = {
	channels: {
		[NotificationChannel.AppPushNotification]: {
			topicTypes: toTopicTypeOptions(appPushTopicTypes),
		},
		[NotificationChannel.Newsletter]: {
			segments: toSegmentOptions(newsletterSegments),
		},
	},
} as const;

const isCampaignLive = (data?: BrazeCampaignDetails): boolean | null =>
	data ? !data.archived && !data.draft && data.enabled : null;

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
	)
	// not requiring permissions for this endpoint as could be
	// needed for troubleshooting by engineers on rota
	// who wouldn't necessarily have DispatchAccess
	.get(
		'/config/email',
		authMiddleware,
		async (_req: Request, res: Response) => {
			const brazeClient = await loadBrazeClient();

			const editions = ['UK', 'US', 'AU'] as Array<
				keyof typeof newsletterSegments
			>;

			const [ukDetails, usDetails, auDetails] = await Promise.all(
				editions.map((key) =>
					brazeClient.getCampaignDetails({
						campaignId: newsletterSegments[key].brazeCampaignId,
						timeoutMs: 2000,
					}),
				),
			);

			res.json({
				UK: {
					...newsletterSegments.UK,
					campaignLive: isCampaignLive(ukDetails?.data),
					...ukDetails,
				},
				US: {
					...newsletterSegments.US,
					campaignLive: isCampaignLive(usDetails?.data),
					...usDetails,
				},
				AU: {
					...newsletterSegments.AU,
					campaignLive: isCampaignLive(auDetails?.data),
					...auDetails,
				},
			});
		},
	);
