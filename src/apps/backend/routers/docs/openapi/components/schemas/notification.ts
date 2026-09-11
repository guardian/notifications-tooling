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
		'failedTargets',
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
			description:
				'The delivery status rolled up from the dispatch outcomes. Any failed outcome makes a new notification failed; dispatches show whether other recipients were reached. partially_delivered is retained for existing records.',
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
		failedTargets: {
			type: 'object',
			description:
				'The targets that failed to dispatch, denormalised from the dispatch outcomes so this can be read without the per-target dispatches. Keys are stored (not labels) so a consumer maps them back via the audiences maps.',
			required: ['topics', 'segments'],
			properties: {
				topics: {
					type: 'array',
					description:
						'The app-push topic type / edition key pairs that failed to push.',
					items: {
						type: 'object',
						required: ['topicType', 'edition'],
						properties: {
							topicType: {
								type: 'string',
								description:
									'The topic type key, mappable to a label via the audiences map.',
							},
							edition: {
								type: 'string',
								description:
									'The edition key, mappable to a label via the topic type in the audiences map.',
							},
						},
					},
				},
				segments: {
					type: 'array',
					description: 'The newsletter segment keys that failed to send.',
					items: {
						type: 'object',
						required: ['segmentId'],
						properties: {
							segmentId: {
								type: 'string',
								description:
									'The segment id key, mappable to a label via the audiences map.',
							},
						},
					},
				},
			},
		},
		dispatches: {
			type: 'array',
			description: 'The downstream provider calls, oldest first.',
			items: { $ref: '#/components/schemas/NotificationDispatch' },
		},
	},
} as const;
