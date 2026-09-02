import { NotificationChannel } from '@config';
import { channelConstraints } from '../../../../channels';

const pushConstraints =
	channelConstraints.channels[NotificationChannel.AppPushNotification];
const newsletterConstraints =
	channelConstraints.channels[NotificationChannel.Newsletter];

/**
 * The limits applied to a single text field. `recommended` and
 * `editorialLimit` are editorial guidance the SPA renders. `validationCap` is
 * present only where a downstream provider imposes a limit, and is the only
 * one this service enforces.
 */
const contentFieldLimitsSchema = {
	type: 'object',
	required: ['recommended', 'editorialLimit'],
	properties: {
		recommended: {
			type: 'integer',
			description:
				"Editorial's preferred length. The SPA badges text within it, but the value is not enforced.",
		},
		editorialLimit: {
			type: 'integer',
			description:
				"Editorial's stated maximum. Guidance only: neither the SPA nor this service blocks past it.",
		},
		validationCap: {
			type: 'integer',
			description:
				'Optional. The maximum number of characters this service accepts, present only where a downstream provider imposes one. Past this the request is rejected with a 422. Absent means the field is unbounded.',
		},
	},
} as const;

/**
 * The `GET /v1/channels/constraints` response body: the per-channel validation
 * rules the SPA uses to drive its UI. Derived from the same config the backend
 * validates `POST /v1/notifications` requests against.
 */
export const channelConstraintsSchema = {
	type: 'object',
	description: 'Per-channel validation rules, keyed by channel.',
	required: ['channels'],
	properties: {
		channels: {
			type: 'object',
			required: [
				NotificationChannel.AppPushNotification,
				NotificationChannel.Newsletter,
			],
			properties: {
				[NotificationChannel.AppPushNotification]: {
					type: 'object',
					required: ['content', 'compose', 'audience'],
					properties: {
						content: {
							type: 'object',
							required: ['title', 'body'],
							properties: {
								title: contentFieldLimitsSchema,
								body: contentFieldLimitsSchema,
							},
							example: pushConstraints.content,
						},
						compose: {
							type: 'object',
							required: ['minItems', 'maxItems'],
							properties: {
								minItems: {
									type: 'integer',
									description:
										'The minimum number of content items a plan must compose.',
								},
								maxItems: {
									type: 'integer',
									description:
										'The maximum number of content items a plan may compose.',
								},
							},
							example: pushConstraints.compose,
						},
						audience: {
							type: 'object',
							required: ['maxTopics'],
							properties: {
								maxTopics: {
									type: 'integer',
									description:
										'The maximum number of app-push topics (topic-type/edition pairs) a push may target.',
								},
							},
							example: pushConstraints.audience,
						},
					},
				},
				[NotificationChannel.Newsletter]: {
					type: 'object',
					required: ['content', 'compose', 'audience'],
					properties: {
						content: {
							type: 'object',
							required: ['title', 'body'],
							properties: {
								title: contentFieldLimitsSchema,
								body: contentFieldLimitsSchema,
							},
							example: newsletterConstraints.content,
						},
						compose: {
							type: 'object',
							required: ['minItems', 'maxItems', 'subject'],
							properties: {
								minItems: {
									type: 'integer',
									description:
										'The minimum number of content items a newsletter plan must compose.',
								},
								maxItems: {
									type: 'integer',
									description:
										'The maximum number of content items a newsletter plan may compose.',
								},
								subject: contentFieldLimitsSchema,
							},
							example: newsletterConstraints.compose,
						},
						audience: {
							type: 'object',
							required: ['maxSegments', 'maxTestRecipients'],
							properties: {
								maxSegments: {
									type: 'integer',
									description:
										'The maximum number of audience segments a newsletter may target.',
								},
								maxTestRecipients: {
									type: 'integer',
									description:
										'The maximum number of ad-hoc test email recipients a newsletter may target.',
								},
							},
							example: newsletterConstraints.audience,
						},
					},
				},
			},
		},
	},
} as const;
