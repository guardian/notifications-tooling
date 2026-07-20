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
					required: ['maxItems'],
					properties: {
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
							description: 'The maximum number of topics a push may target.',
						},
					},
					example: pushConstraints.audience,
				},
			},
		},
		[NotificationChannel.Newsletter]: {
			type: 'object',
			required: ['content', 'compose'],
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
					required: ['layouts', 'subject'],
					properties: {
						layouts: {
							type: 'array',
							items: { type: 'string' },
							description: 'The layouts a newsletter plan may compose into.',
						},
						subject: maxLengthSchema,
					},
					example: newsletterConstraints.compose,
				},
			},
		},
	},
} as const;
