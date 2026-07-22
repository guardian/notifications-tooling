import { NotificationChannel } from '@config';
import { channelConstraints } from '../../../../channels';

const pushConstraints =
	channelConstraints[NotificationChannel.AppPushNotification];
const newsletterConstraints =
	channelConstraints[NotificationChannel.Newsletter];

/** A `{ maxLength }` limit applied to a single text field. */
const maxLengthSchema = {
	type: 'object',
	required: ['maxLength'],
	properties: {
		maxLength: {
			type: 'integer',
			description: 'The maximum number of characters allowed.',
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
						title: maxLengthSchema,
						body: maxLengthSchema,
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
						title: maxLengthSchema,
						body: maxLengthSchema,
					},
					example: newsletterConstraints.content,
				},
				compose: {
					type: 'object',
					required: ['minItems', 'subject'],
					properties: {
						minItems: {
							type: 'integer',
							description:
								'The minimum number of content items a newsletter plan must compose.',
						},
						subject: maxLengthSchema,
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
} as const;
