/**
 * The `202 Accepted` response body returned by `POST /v1/notifications` after
 * the current synchronous dispatch completes successfully.
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
			items: { $ref: '#/components/schemas/NotificationPlanAcceptance' },
		},
		statusUrl: {
			type: 'string',
			description:
				'Reserved URL for per-channel delivery status. The status endpoint is not implemented yet.',
			example: '/v1/notifications/<notificationId>/status',
		},
		cancellable: {
			type: 'object',
			description:
				'Reserved cancellation details. Cancellation is not implemented yet.',
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
