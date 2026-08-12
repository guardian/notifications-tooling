import {
	appPushEditionIdsByTopicType,
	appPushTestEditionIdsByTopicType,
	appPushTestTopicTypeIds,
	appPushTopicTypeIds,
	MAX_APP_PUSH_TOPICS,
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
		.max(pushLimits.title.validationCap)
		.meta({
			description: `Short push notification title (1-${pushLimits.title.validationCap} characters).`,
			example: 'Breaking news',
		}),
	body: z
		.string()
		.min(1)
		.max(pushLimits.body.validationCap)
		.meta({
			description: `Push notification body (1-${pushLimits.body.validationCap} characters).`,
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
		.max(newsletterLimits.title.validationCap)
		.meta({
			description: `Headline shown in the email (1-${newsletterLimits.title.validationCap} characters).`,
			example: 'Your morning briefing',
		}),
	body: z
		.string()
		.min(1)
		.max(newsletterLimits.body.validationCap)
		.meta({
			description: `Email body copy (1-${newsletterLimits.body.validationCap} characters).`,
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
const segmentAudience = <
	const SegmentIds extends readonly [string, ...string[]],
>(
	segmentIds: SegmentIds,
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

const newsletterSegmentAudience = segmentAudience(
	newsletterSegmentIds,
	MAX_NEWSLETTER_SEGMENTS,
);

/** Every `{ type, name }` pair must be distinct. */
const hasUniqueTopics = (items: Array<{ type: string; name: string }>) =>
	new Set(items.map(({ type, name }) => `${type}\u0000${name}`)).size ===
	items.length;

/**
 * A single app-push target: a curated topic type and one of its editions. The
 * backend resolves the pair to a downstream topic (kept server-side). The set
 * of topic types and their editions is served by `GET /v1/channels/audiences`.
 */
const appPushTopicSelection = <
	const TopicTypeIds extends readonly [string, ...string[]],
>(
	topicTypeIds: TopicTypeIds,
	editionIdsByTopicType: Record<TopicTypeIds[number], readonly string[]>,
	editionExample: string,
) =>
	z
		.strictObject({
			type: z.enum(topicTypeIds).meta({
				description: 'Topic type id (the FE\'s "topic type" dropdown).',
				example: topicTypeIds[0],
			}),
			name: z.string().min(1).meta({
				description: 'Edition id within the chosen topic type.',
				example: editionExample,
			}),
		})
		.superRefine((topic, ctx) => {
			const editions: readonly string[] =
				editionIdsByTopicType[topic.type as TopicTypeIds[number]];
			if (!editions.includes(topic.name)) {
				ctx.addIssue({
					code: 'custom',
					path: ['name'],
					message: `'${topic.name}' is not a valid edition for topic type '${topic.type}'. Valid editions: ${editions.join(', ')}.`,
				});
			}
		});

/**
 * Push targets a list of topic-type/edition pairs, each resolving to one
 * downstream topic, capped at the per-push limit.
 */
const appPushTopicAudience = <
	const TopicTypeIds extends readonly [string, ...string[]],
>(
	topicTypeIds: TopicTypeIds,
	editionIdsByTopicType: Record<TopicTypeIds[number], readonly string[]>,
	exampleItem: { type: string; name: string },
	description: string,
) =>
	z.strictObject({
		type: z.literal('topic'),
		items: z
			.array(
				appPushTopicSelection(
					topicTypeIds,
					editionIdsByTopicType,
					exampleItem.name,
				),
			)
			.min(1)
			.max(MAX_APP_PUSH_TOPICS)
			.refine(hasUniqueTopics, { message: 'app-push topics must be unique.' })
			.meta({ description, example: [exampleItem] }),
	});

const productionAppPushTopicAudience = appPushTopicAudience(
	appPushTopicTypeIds,
	appPushEditionIdsByTopicType,
	{ type: appPushTopicTypeIds[0], name: 'uk' },
	`Up to ${MAX_APP_PUSH_TOPICS} topic-type/edition pairs to deliver to. The valid set is served by GET /v1/channels/audiences.`,
);

/** Test push may only target the internal test topic, never a production one. */
const testAppPushTopicAudience = appPushTopicAudience(
	appPushTestTopicTypeIds,
	appPushTestEditionIdsByTopicType,
	{
		type: appPushTestTopicTypeIds[0],
		name: appPushTestEditionIdsByTopicType[appPushTestTopicTypeIds[0]][0],
	},
	`Up to ${MAX_APP_PUSH_TOPICS} internal test topic pairs. Test sends may only target the internal test topic; production topics are rejected.`,
);

/** Ad-hoc test recipients addressed by email. */
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

/** Push takes a single content item. */
const appPushCompose = z.strictObject({
	use: z.string().min(1).meta({
		description:
			'The id of the single content item (from `content.items`) to send.',
		example: 'lead-story',
	}),
});

/** Newsletter composes a single content item into an email. */
const newsletterCompose = z.strictObject({
	items: z
		.array(z.string().min(1))
		.min(1)
		.max(1)
		.meta({
			description:
				'Id of the single content item (from `content.items`) to include, provided as a one-element array.',
			example: ['lead-story'],
		}),
	subject: z.string().min(1).max(newsletterLimits.title.validationCap).meta({
		description: 'The email subject line.',
		example: 'Your morning briefing',
	}),
});

/** A newsletter delivery plan: who to target and which items to assemble. */
const newsletterPlan = z.strictObject({
	audience: newsletterSegmentAudience,
	compose: newsletterCompose,
});

/** A test newsletter plan targets explicit email addresses only. */
const newsletterTestPlan = z.strictObject({
	audience: testEmailAudience,
	variants: z
		.array(z.enum(newsletterSegmentIds))
		.min(1)
		.max(MAX_NEWSLETTER_SEGMENTS)
		.refine(hasUniqueItems, { message: 'variant ids must be unique.' })
		.meta({
			description:
				'Newsletter variants whose rendering configuration should be used. Their production campaigns are not triggered.',
			example: [newsletterSegmentIds[0]],
		}),
	compose: newsletterCompose,
});

/** An app-push delivery plan: who to target and the single item to send. */
const appPushPlan = z.strictObject({
	audience: productionAppPushTopicAudience,
	compose: appPushCompose,
});

/** A test app-push plan targets the internal test topic only. */
const appPushTestPlan = z.strictObject({
	audience: testAppPushTopicAudience,
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

const testChannelsSchema = z
	.strictObject({
		[NotificationChannel.Newsletter]: newsletterTestPlan.optional(),
		[NotificationChannel.AppPushNotification]: appPushTestPlan.optional(),
	})
	.refine((channels) => Object.keys(channels).length > 0, {
		message: 'At least one channel must be provided.',
	})
	.meta({
		description:
			'Test delivery plans keyed by channel. Newsletter targets explicit email recipients; app-push targets the internal test topic only. A channel may appear at most once; provide at least one.',
	});

const requestBaseShape = {
	idempotencyKey: z.string().min(1).meta({
		description:
			'Client-generated unique key so retries are not delivered twice.',
		example: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
	}),
	content: contentSchema,
	sender: z.string().min(1).meta({
		description: 'Identifier of the team or system making the request.',
		example: 'notifications-tooling-spa/v1',
	}),
};

type ComposeReference = {
	channel: NotificationChannel;
	key: string;
	path: PropertyKey[];
};

const composeReferenceIssues = (
	items: z.infer<typeof contentSchema>['items'],
	references: ComposeReference[],
) =>
	references.flatMap(({ channel, key, path }) => {
		const item = items[key];
		const issuePath = ['channels', channel, ...path];

		if (!item) {
			return [
				{
					code: 'custom' as const,
					path: issuePath,
					message: `compose references content item '${key}' which is not defined in content.items.`,
				},
			];
		}

		if (item.type !== channel) {
			return [
				{
					code: 'custom' as const,
					path: issuePath,
					message: `content item '${key}' has type '${item.type}' but is composed into a '${channel}' plan.`,
				},
			];
		}

		return [];
	});

/**
 * The `POST /v1/notifications` request body. NOTE: `idempotencyKey` is required
 * but, without a persistence layer, not yet stored or deduplicated against.
 */
export const notificationSendRequestSchema = z
	.strictObject({
		...requestBaseShape,
		channels: channelsSchema,
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
		const composeRefs: ComposeReference[] = [];

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

		for (const issue of composeReferenceIssues(items, composeRefs)) {
			ctx.addIssue(issue);
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

/** The `POST /v1/notification-tests` request body. Test sends are immediate. */
export const notificationTestSendRequestSchema = z
	.strictObject({
		...requestBaseShape,
		channels: testChannelsSchema,
		options: z
			.strictObject({
				dryRun: z.boolean().default(false).meta({
					description:
						'When true, content is validated and rendered but no recipients are registered and no messages are sent.',
					example: false,
				}),
			})
			.default({ dryRun: false }),
	})
	.superRefine((value, ctx) => {
		const composeRefs: ComposeReference[] = [];

		const newsletter = value.channels[NotificationChannel.Newsletter];
		if (newsletter) {
			newsletter.compose.items.forEach((key, index) => {
				composeRefs.push({
					channel: NotificationChannel.Newsletter,
					key,
					path: ['compose', 'items', index],
				});
			});
		}

		const appPush = value.channels[NotificationChannel.AppPushNotification];
		if (appPush) {
			composeRefs.push({
				channel: NotificationChannel.AppPushNotification,
				key: appPush.compose.use,
				path: ['compose', 'use'],
			});
		}

		for (const issue of composeReferenceIssues(
			value.content.items,
			composeRefs,
		)) {
			ctx.addIssue(issue);
		}
	})
	.meta({
		description: 'The POST /v1/notification-tests request body.',
		example: {
			idempotencyKey: 'test-2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
			content: {
				items: {
					'lead-story': {
						type: NotificationChannel.Newsletter,
						title: 'Your morning briefing',
						body: 'The three stories shaping the day.',
						link: 'https://www.theguardian.com/environment/2026/jul/20/global-climate-deal',
					},
				},
			},
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: {
						type: 'email',
						items: ['newsletters.test@theguardian.com'],
					},
					variants: [newsletterSegmentIds[0]],
					compose: {
						items: ['lead-story'],
						subject: '[TEST] Your morning briefing',
					},
				},
			},
			sender: 'notifications-tooling-spa/v1',
			options: { dryRun: false },
		},
	});

export type NotificationTestSendRequest = z.infer<
	typeof notificationTestSendRequestSchema
>;
