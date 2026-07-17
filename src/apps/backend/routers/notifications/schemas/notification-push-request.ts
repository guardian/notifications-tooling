import {
	MAX_PUSH_TOPICS,
	newsletterSegments,
	NotificationChannel,
	notificationChannelContentLimits,
	pushTopics,
} from '@config';
import { isGuardianUrl } from '@utils';
import { z } from 'zod';

const pushLimits =
	notificationChannelContentLimits[NotificationChannel.AppPushNotification];
const newsletterLimits =
	notificationChannelContentLimits[NotificationChannel.Newsletter];

/**
 * A Guardian news article link. Provided as a simple URL string, so we check it
 * is a real URL *and* that it points at a Guardian domain.
 */
const guardianArticleLink = z.url().refine(isGuardianUrl, {
	message:
		'link must be an https Guardian article URL (e.g. https://www.theguardian.com/...).',
});

/** Media is limited to images for now. */
const mediaSchema = z.object({
	type: z.literal('image'),
	imageUrl: z.url(),
	thumbnailUrl: z.url().optional(),
});

/**
 * A content item destined for the `app-push-notification` channel. Delivered
 * via FCM/APNS, so `title` and `body` use the stricter push limits.
 */
const appPushContentItem = z.object({
	type: z.literal(NotificationChannel.AppPushNotification),
	title: z.string().min(1).max(pushLimits.title.maxLength),
	body: z.string().min(1).max(pushLimits.body.maxLength),
	link: guardianArticleLink,
	media: mediaSchema.optional(),
});

/**
 * A content item destined for the `newsletter` channel. Delivered via Braze, so
 * `title` and `body` use the more generous newsletter limits.
 */
const newsletterContentItem = z.object({
	type: z.literal(NotificationChannel.Newsletter),
	title: z.string().min(1).max(newsletterLimits.title.maxLength),
	body: z.string().min(1).max(newsletterLimits.body.maxLength),
	link: guardianArticleLink,
	media: mediaSchema.optional(),
});

/**
 * A content item. `type` ties the item to the channel it is authored for, which
 * lets us apply the correct per-channel limits at validation time.
 */
const contentItem = z.discriminatedUnion('type', [
	appPushContentItem,
	newsletterContentItem,
]);

const contentSchema = z.object({
	items: z
		.record(z.string().min(1), contentItem)
		.refine((items) => Object.keys(items).length > 0, {
			message: 'content.items must contain at least one item.',
		}),
});

/** Newsletter audiences are addressed by a known Braze segment. */
const segmentAudience = z.object({
	type: z.literal('segment'),
	segments: z.array(z.object({ name: z.enum(newsletterSegments) })).min(1),
});

const knownPushTopics = new Set(
	pushTopics.map((topic) => `${topic.type}:${topic.name}`),
);

/** A single, known mobile-n10n topic. */
const pushTopic = z
	.object({ type: z.string().min(1), name: z.string().min(1) })
	.refine((topic) => knownPushTopics.has(`${topic.type}:${topic.name}`), {
		message: 'unknown push topic.',
	});

/** Push audiences are addressed by a known mobile-n10n topic. */
const topicAudience = z.object({
	type: z.literal('topic'),
	topics: z.array(pushTopic).min(1).max(MAX_PUSH_TOPICS),
});

/** Push takes a single content item. */
const appPushCompose = z.object({
	use: z.string().min(1),
});

/** Newsletter assembles many content items into a digest. */
const newsletterCompose = z.object({
	layout: z.enum(['digest', 'single']).default('digest'),
	items: z.array(z.string().min(1)).min(1),
	subject: z.string().min(1).max(newsletterLimits.title.maxLength),
});

/**
 * A delivery plan. `channel` discriminates the plan and, in doing so, pins the
 * audience and compose shapes valid for that channel (push -> topic + single
 * item, newsletter -> segment + digest).
 */
const planSchema = z.discriminatedUnion('channel', [
	z.object({
		channel: z.literal(NotificationChannel.AppPushNotification),
		audience: topicAudience,
		compose: appPushCompose,
	}),
	z.object({
		channel: z.literal(NotificationChannel.Newsletter),
		audience: segmentAudience,
		compose: newsletterCompose,
	}),
]);

/**
 * The `POST /v1/notifications` request body.
 *
 * NOTE: `idempotencyKey` is required but, without a persistence layer, it is not
 * yet stored or checked against previously sent notifications.
 */
export const notificationPushRequestSchema = z
	.object({
		idempotencyKey: z.string().min(1),
		category: z.string().min(1),
		priority: z.enum(['standard', 'high']).default('standard'),
		content: contentSchema,
		channels: z.array(planSchema).min(1),
		sender: z.string().min(1),
		options: z
			.object({
				dryRun: z.boolean().default(false),
				scheduledFor: z.iso.datetime().nullable().default(null),
			})
			.default({ dryRun: false, scheduledFor: null }),
	})
	.superRefine((value, ctx) => {
		const { items } = value.content;

		// The only genuinely cross-field rule: a plan's `compose` may only
		// reference content items that exist and match the plan's channel.
		for (const [planIndex, plan] of value.channels.entries()) {
			const refs =
				plan.channel === NotificationChannel.AppPushNotification
					? [{ key: plan.compose.use, path: ['compose', 'use'] }]
					: plan.compose.items.map((key, index) => ({
							key,
							path: ['compose', 'items', index],
						}));

			for (const { key, path } of refs) {
				const item = items[key];
				const issuePath = ['channels', planIndex, ...path];

				if (!item) {
					ctx.addIssue({
						code: 'custom',
						path: issuePath,
						message: `compose references content item '${key}' which is not defined in content.items.`,
					});
				} else if (item.type !== plan.channel) {
					ctx.addIssue({
						code: 'custom',
						path: issuePath,
						message: `content item '${key}' has type '${item.type}' but is composed into a '${plan.channel}' plan.`,
					});
				}
			}
		}
	});

export type NotificationPushRequest = z.infer<
	typeof notificationPushRequestSchema
>;
