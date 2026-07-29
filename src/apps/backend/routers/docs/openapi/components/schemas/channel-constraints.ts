import { NotificationChannel } from '@config';
import { channelConstraints } from '../../../../channels';

const pushConstraints =
	channelConstraints.channels[NotificationChannel.AppPushNotification];
const newsletterConstraints =
	channelConstraints.channels[NotificationChannel.Newsletter];

/**
 * The three limits applied to a single text field. Only `validationCap` is
 * enforced by this service; the other two are editorial guidance the SPA
 * renders.
 */
const contentFieldLimitsSchema = {
	type: 'object',
	required: ['recommended', 'editorialLimit', 'validationCap'],
	properties: {
		recommended: {
			type: 'integer',
			description:
				"Editorial's preferred length. The SPA warns past this, but the value is not enforced.",
		},
		editorialLimit: {
			type: 'integer',
			description:
				"Editorial's stated maximum. The SPA badges it as reached, but deliberately does not block, and this service does not enforce it.",
		},
		validationCap: {
			type: 'integer',
			description:
				'The maximum number of characters this service accepts. Past this the request is rejected with a 422. Guards against absurd input rather than expressing editorial preference.',
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
							required: ['maxSegments'],
							properties: {
								maxSegments: {
									type: 'integer',
									description:
										'The maximum number of audience segments a push may target.',
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
