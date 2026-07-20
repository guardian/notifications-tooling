import { NotificationChannel } from '@config';

/**
 * The `202 Accepted` response body returned by `POST /v1/notifications` once a
 * request passes validation and is enqueued for per-channel dispatch.
 */
export const acceptedNotificationSchema = {
	type: 'object',
	required: ['notificationId', 'status', 'plans', 'statusUrl', 'cancellable'],
	properties: {
		notificationId: {
			type: 'string',
			format: 'uuid',
			description: 'The broker-assigned id for the accepted notification.',
		},
		status: { type: 'string', enum: ['accepted'] },
		plans: {
			type: 'array',
			description: 'One entry per requested delivery channel.',
			items: {
				type: 'object',
				required: ['channel', 'planId', 'status'],
				properties: {
					channel: {
						type: 'string',
						enum: Object.values(NotificationChannel),
					},
					planId: {
						type: 'string',
						example: '<notificationId>#newsletter',
					},
					status: { type: 'string', enum: ['accepted'] },
				},
			},
		},
		statusUrl: {
			type: 'string',
			description: 'Poll this URL for per-channel delivery status.',
			example: '/v1/notifications/<notificationId>/status',
		},
		cancellable: {
			type: 'object',
			description:
				'The window during which the notification may still be cancelled.',
			required: ['cancelUrl', 'expiresAt'],
			properties: {
				cancelUrl: {
					type: 'string',
					example: '/v1/notifications/<notificationId>/cancel',
				},
				expiresAt: {
					type: 'integer',
					description: 'Unix epoch (seconds) after which cancellation fails.',
				},
			},
		},
	},
} as const;
