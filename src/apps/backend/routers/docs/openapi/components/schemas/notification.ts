/**
 * The persisted notification and its dispatch outcomes. The single
 * representation returned by `POST /v1/notifications`,
 * `POST /v1/notification-tests`, and `GET /v1/notifications/{id}`. Referenced
 * via `#/components/schemas/Notification`.
 */
export const notificationSchema = {
	type: 'object',
	required: [
		'id',
		'idempotencyKey',
		'kind',
		'status',
		'sender',
		'createdByEmail',
		'dryRun',
		'scheduledFor',
		'content',
		'channels',
		'createdAt',
		'updatedAt',
		'dispatches',
	],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
			description: 'The broker-assigned notification id.',
		},
		idempotencyKey: {
			type: 'string',
			description: 'The client-supplied key that de-duplicates the request.',
		},
		kind: {
			type: 'string',
			description: 'Whether this was a production send or a test send.',
			enum: ['send', 'test'],
		},
		status: {
			type: 'string',
			description: 'The delivery status rolled up from the dispatch outcomes.',
			enum: ['accepted', 'delivered', 'partially_delivered', 'failed'],
		},
		sender: {
			type: 'string',
			description: 'The client that submitted the notification.',
			example: 'notifications-tooling-spa/v1',
		},
		createdByEmail: {
			type: 'string',
			format: 'email',
			description: 'The pan-domain-authenticated user who created the request.',
		},
		dryRun: {
			type: 'boolean',
			description: 'Whether the notification was submitted as a dry run.',
		},
		scheduledFor: {
			type: ['string', 'null'],
			format: 'date-time',
			description:
				'When the notification is scheduled to send, or null if sent immediately.',
		},
		content: {
			type: 'object',
			description: 'The validated content items, stored verbatim.',
			additionalProperties: true,
		},
		channels: {
			type: 'object',
			description:
				'The per-channel audience and compose selections, stored verbatim.',
			additionalProperties: true,
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
			description: 'When the notification was persisted.',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
			description: 'When the notification was last updated.',
		},
		dispatches: {
			type: 'array',
			description: 'The downstream provider calls, oldest first.',
			items: { $ref: '#/components/schemas/NotificationDispatch' },
		},
	},
} as const;
