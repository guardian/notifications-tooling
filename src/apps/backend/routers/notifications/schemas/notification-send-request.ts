import {
	appPushNotificationSegmentIds,
	MAX_APP_PUSH_SEGMENTS,
	MAX_NEWSLETTER_SEGMENTS,
	MAX_TEST_EMAIL_RECIPIENTS,
	newsletterSegmentIds,
	NotificationChannel,
	notificationChannelContentLimits,
} from '@config';
import { isGuardianUrl } from '@utils';
import { z } from 'zod';

const pushLimits =
	notificationChannelContentLimits[NotificationChannel.AppPushNotification];
const newsletterLimits =
	notificationChannelContentLimits[NotificationChannel.Newsletter];

/** Every value in the list must be distinct. */
const hasUniqueItems = (items: unknown[]) =>
	new Set(items).size === items.length;

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

const mediaSchema = z
	.strictObject({
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

/** A content item for the `app-push` channel (stricter limits). */
const appPushContentItem = z.strictObject({
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

/** A content item for the `newsletter` channel (more generous limits). */
const newsletterContentItem = z.strictObject({
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

/** `type` ties each item to its channel so per-channel limits apply. */
const contentItem = z.discriminatedUnion('type', [
	appPushContentItem,
	newsletterContentItem,
]);

const contentSchema = z.strictObject({
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

/**
 * A channel-agnostic audience addressed by known segment ids; each channel
 * accepts only its own. The broker resolves segments to the downstream Braze
 * campaign / mobile-n10n topic, keeping those internals out of the payload.
 * `maxSegments` is the channel's downstream cap (Braze campaigns for
 * newsletter, mobile-n10n topics for push), which differ per contract.
 */
const segmentAudience = (
	segmentIds:
		typeof newsletterSegmentIds | typeof appPushNotificationSegmentIds,
	maxSegments: number,
) =>
	z.strictObject({
		type: z.literal('segment'),
		items: z
			.array(z.enum(segmentIds))
			.min(1)
			.max(maxSegments)
			.refine(hasUniqueItems, { message: 'segment ids must be unique.' })
			.meta({
				description: `Up to ${maxSegments} known audience segment ids to deliver to. The valid set is served by GET /v1/channels/audiences.`,
				example: [segmentIds[0]],
			}),
	});

const appPushSegmentAudience = segmentAudience(
	appPushNotificationSegmentIds,
	MAX_APP_PUSH_SEGMENTS,
);
const newsletterSegmentAudience = segmentAudience(
	newsletterSegmentIds,
	MAX_NEWSLETTER_SEGMENTS,
);

/** Ad-hoc test recipients addressed by email, bypassing segments. */
const testEmailAudience = z.strictObject({
	type: z.literal('email'),
	items: z
		.array(z.email())
		.min(1)
		.max(MAX_TEST_EMAIL_RECIPIENTS)
		.refine(hasUniqueItems, { message: 'email addresses must be unique.' })
		.meta({
			description: `Up to ${MAX_TEST_EMAIL_RECIPIENTS} email addresses to send a test to.`,
			example: ['newsletters.test@theguardian.com'],
		}),
});

/** Newsletter audiences may target segments or an ad-hoc list of test emails. */
const newsletterAudience = z.discriminatedUnion('type', [
	newsletterSegmentAudience,
	testEmailAudience,
]);

/** Push takes a single content item. */
const appPushCompose = z.strictObject({
	use: z.string().min(1).meta({
		description:
			'The id of the single content item (from `content.items`) to send.',
		example: 'lead-story',
	}),
});

/** Newsletter assembles many content items into a digest. */
const newsletterCompose = z.strictObject({
	items: z
		.array(z.string().min(1))
		.min(1)
		.refine(hasUniqueItems, { message: 'compose item ids must be unique.' })
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

/** A newsletter delivery plan: who to target and which items to assemble. */
const newsletterPlan = z.strictObject({
	audience: newsletterAudience,
	compose: newsletterCompose,
});

/** An app-push delivery plan: who to target and the single item to send. */
const appPushPlan = z.strictObject({
	audience: appPushSegmentAudience,
	compose: appPushCompose,
});

/**
 * Delivery plans keyed by channel, so a channel can appear at most once. At
 * least one channel must be present.
 */
const channelsSchema = z
	.strictObject({
		[NotificationChannel.Newsletter]: newsletterPlan.optional(),
		[NotificationChannel.AppPushNotification]: appPushPlan.optional(),
	})
	.refine((channels) => Object.keys(channels).length > 0, {
		message: 'At least one channel must be provided.',
	})
	.meta({
		description:
			'Delivery plans keyed by channel. A channel may appear at most once; provide at least one.',
	});

/**
 * The `POST /v1/notifications` request body. NOTE: `idempotencyKey` is required
 * but, without a persistence layer, not yet stored or deduplicated against.
 */
export const notificationSendRequestSchema = z
	.strictObject({
		idempotencyKey: z.string().min(1).meta({
			description:
				'Client-generated unique key so retries are not delivered twice.',
			example: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
		}),
		content: contentSchema,
		channels: channelsSchema,
		sender: z.string().min(1).meta({
			description: 'Identifier of the team or system sending the notification.',
			example: 'editorial-breaking-news',
		}),
		options: z
			.strictObject({
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
		const { channels } = value;

		// Cross-field rule: `compose` may only reference existing content items
		// whose type matches the channel it is composed into.
		const composeRefs: Array<{
			channel: NotificationChannel;
			key: string;
			path: PropertyKey[];
		}> = [];

		const appPush = channels[NotificationChannel.AppPushNotification];
		if (appPush) {
			composeRefs.push({
				channel: NotificationChannel.AppPushNotification,
				key: appPush.compose.use,
				path: ['compose', 'use'],
			});
		}

		const newsletter = channels[NotificationChannel.Newsletter];
		if (newsletter) {
			newsletter.compose.items.forEach((key, index) => {
				composeRefs.push({
					channel: NotificationChannel.Newsletter,
					key,
					path: ['compose', 'items', index],
				});
			});
		}

		for (const { channel, key, path } of composeRefs) {
			const item = items[key];
			const issuePath = ['channels', channel, ...path];

			if (!item) {
				ctx.addIssue({
					code: 'custom',
					path: issuePath,
					message: `compose references content item '${key}' which is not defined in content.items.`,
				});
			} else if (item.type !== channel) {
				ctx.addIssue({
					code: 'custom',
					path: issuePath,
					message: `content item '${key}' has type '${item.type}' but is composed into a '${channel}' plan.`,
				});
			}
		}
	})
	.meta({
		description: 'The POST /v1/notifications request body.',
		example: {
			idempotencyKey: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
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
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: {
						type: 'segment',
						items: [newsletterSegmentIds[0]],
					},
					compose: {
						items: ['lead-story'],
						subject: 'Your morning briefing',
					},
				},
			},
			sender: 'editorial-newsletters',
			options: { dryRun: false, scheduledFor: null },
		},
	});

export type NotificationSendRequest = z.infer<
	typeof notificationSendRequestSchema
>;
