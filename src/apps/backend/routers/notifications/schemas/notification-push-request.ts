import {
	MAX_PUSH_TOPICS,
	newsletterCampaigns,
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
const guardianArticleLink = z
	.url()
	.refine(isGuardianUrl, {
		message:
			'link must be an https Guardian article URL (e.g. https://www.theguardian.com/...).',
	})
	.meta({
		description:
			'Canonical https link to the Guardian article the notification promotes.',
		example:
			'https://www.theguardian.com/environment/2026/jul/20/global-climate-deal',
	});

/** Media is limited to images for now. */
const mediaSchema = z
	.object({
		type: z.literal('image'),
		imageUrl: z.url().meta({
			description: 'Full-size image displayed alongside the notification.',
			example: 'https://media.guim.co.uk/img/media/lead.jpg',
		}),
		thumbnailUrl: z.url().optional().meta({
			description: 'Optional smaller preview image.',
			example: 'https://media.guim.co.uk/img/media/thumb.jpg',
		}),
	})
	.meta({ description: 'Optional media attachment (images only for now).' });

/**
 * A content item destined for the `app-push-notification` channel. Delivered
 * via FCM/APNS, so `title` and `body` use the stricter push limits.
 */
const appPushContentItem = z.object({
	type: z.literal(NotificationChannel.AppPushNotification),
	title: z
		.string()
		.min(1)
		.max(pushLimits.title.maxLength)
		.meta({
			description: `Short push alert title (1-${pushLimits.title.maxLength} characters).`,
			example: 'Breaking news',
		}),
	body: z
		.string()
		.min(1)
		.max(pushLimits.body.maxLength)
		.meta({
			description: `Push alert body (1-${pushLimits.body.maxLength} characters).`,
			example: 'Historic global climate deal reached at the COP summit',
		}),
	link: guardianArticleLink,
	media: mediaSchema.optional(),
});

/**
 * A content item destined for the `newsletter` channel. Delivered via Braze, so
 * `title` and `body` use the more generous newsletter limits.
 */
const newsletterContentItem = z.object({
	type: z.literal(NotificationChannel.Newsletter),
	title: z
		.string()
		.min(1)
		.max(newsletterLimits.title.maxLength)
		.meta({
			description: `Headline shown in the email (1-${newsletterLimits.title.maxLength} characters).`,
			example: 'Your morning briefing',
		}),
	body: z
		.string()
		.min(1)
		.max(newsletterLimits.body.maxLength)
		.meta({
			description: `Email body copy (1-${newsletterLimits.body.maxLength} characters).`,
			example:
				'The three stories shaping the day, plus what to keep an eye on.',
		}),
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
		})
		.meta({
			description:
				'Content items keyed by an author-chosen id (e.g. "lead-story"). A plan\'s `compose` references items by these ids.',
		}),
});

/** Newsletter audiences are addressed by a known Braze campaign. */
const campaignAudience = z.object({
	type: z.literal('campaign'),
	campaigns: z
		.array(z.object({ id: z.enum(newsletterCampaigns) }))
		.min(1)
		.meta({
			description: 'One or more known Braze campaigns to deliver to.',
			example: [{ id: newsletterCampaigns[0] }],
		}),
});

const knownPushTopics = new Set(
	pushTopics.map((topic) => `${topic.type}:${topic.name}`),
);

/** A single, known mobile-n10n topic. */
const pushTopic = z
	.object({
		type: z
			.string()
			.min(1)
			.meta({ description: 'Topic type.', example: 'breaking' }),
		name: z.string().min(1).meta({ description: 'Topic name.', example: 'uk' }),
	})
	.refine((topic) => knownPushTopics.has(`${topic.type}:${topic.name}`), {
		message: 'unknown push topic.',
	})
	.meta({
		description: 'A single, known mobile-n10n topic.',
		example: { type: 'breaking', name: 'uk' },
	});

/** Push audiences are addressed by a known mobile-n10n topic. */
const topicAudience = z.object({
	type: z.literal('topic'),
	topics: z
		.array(pushTopic)
		.min(1)
		.max(MAX_PUSH_TOPICS)
		.meta({
			description: `Up to ${MAX_PUSH_TOPICS} mobile-n10n topics to target.`,
		}),
});

/** Push takes a single content item. */
const appPushCompose = z.object({
	use: z.string().min(1).meta({
		description:
			'The id of the single content item (from `content.items`) to send.',
		example: 'lead-story',
	}),
});

/** Newsletter assembles many content items into a digest. */
const newsletterCompose = z.object({
	items: z
		.array(z.string().min(1))
		.min(1)
		.meta({
			description:
				'Ordered ids of the content items (from `content.items`) to include.',
			example: ['lead-story'],
		}),
	subject: z.string().min(1).max(newsletterLimits.title.maxLength).meta({
		description: 'The email subject line.',
		example: 'Your morning briefing',
	}),
});

/**
 * A delivery plan. `channel` discriminates the plan and, in doing so, pins the
 * audience and compose shapes valid for that channel (push -> topic + single
 * item, newsletter -> campaign + digest).
 */
const planSchema = z.discriminatedUnion('channel', [
	z.object({
		channel: z.literal(NotificationChannel.AppPushNotification),
		audience: topicAudience,
		compose: appPushCompose,
	}),
	z.object({
		channel: z.literal(NotificationChannel.Newsletter),
		audience: campaignAudience,
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
		idempotencyKey: z.string().min(1).meta({
			description:
				'Client-generated unique key so retries are not delivered twice.',
			example: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
		}),
		category: z.string().min(1).meta({
			description: 'Editorial category used for routing and reporting.',
			example: 'breaking-news',
		}),
		priority: z.enum(['standard', 'high']).default('standard').meta({
			description:
				'Delivery priority. `high` is reserved for time-critical alerts.',
			example: 'high',
		}),
		content: contentSchema,
		channels: z.array(planSchema).min(1).meta({
			description:
				'One delivery plan per channel. Each plan pins the audience and compose shape valid for its channel.',
		}),
		sender: z.string().min(1).meta({
			description: 'Identifier of the team or system sending the notification.',
			example: 'editorial-breaking-news',
		}),
		options: z
			.object({
				dryRun: z.boolean().default(false).meta({
					description:
						'When true, the request is validated but nothing is dispatched.',
					example: false,
				}),
				scheduledFor: z.iso.datetime().nullable().default(null).meta({
					description:
						'ISO-8601 timestamp to send at, or null to send immediately.',
					example: null,
				}),
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
	})
	.meta({
		description: 'The POST /v1/notifications request body.',
		example: {
			idempotencyKey: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
			category: 'morning-briefing',
			priority: 'standard',
			content: {
				items: {
					'lead-story': {
						type: NotificationChannel.Newsletter,
						title: 'Your morning briefing',
						body: 'The three stories shaping the day, plus what to keep an eye on.',
						link: 'https://www.theguardian.com/environment/2026/jul/20/global-climate-deal',
					},
				},
			},
			channels: [
				{
					channel: NotificationChannel.Newsletter,
					audience: {
						type: 'campaign',
						campaigns: [{ id: newsletterCampaigns[0] }],
					},
					compose: {
						items: ['lead-story'],
						subject: 'Your morning briefing',
					},
				},
			],
			sender: 'editorial-newsletters',
			options: { dryRun: false, scheduledFor: null },
		},
	});

export type NotificationPushRequest = z.infer<
	typeof notificationPushRequestSchema
>;
