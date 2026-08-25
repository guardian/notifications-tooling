/**
 * The `202` response body for `POST /v1/notifications` and
 * `POST /v1/notification-tests`: the persisted notification resource with its
 * dispatch outcomes nested underneath. Referenced via
 * `#/components/schemas/NotificationResource`.
 */
export const notificationResourceSchema = {
	type: 'object',
	required: [
		'id',
		'idempotencyKey',
		'kind',
		'status',
		'sender',
		'dryRun',
		'scheduledFor',
		'createdAt',
		'dispatches',
	],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
			description: 'The stored notification id.',
		},
		idempotencyKey: {
			type: 'string',
			description: 'The client-supplied key the send was recorded under.',
		},
		kind: {
			type: 'string',
			enum: ['send', 'test'],
			description: 'Whether this was a production send or a test send.',
		},
		status: {
			type: 'string',
			enum: ['accepted', 'delivered', 'partially_delivered', 'failed'],
			description:
				'Rolled up from the dispatch outcomes: delivered when every call succeeded, failed when every call failed, partially_delivered on a mix, and accepted when nothing was dispatched (e.g. a dry run).',
		},
		sender: {
			type: 'string',
			description: 'Identifier of the team or system that made the request.',
		},
		dryRun: {
			type: 'boolean',
			description:
				'Whether the request was validated (and rendered) without dispatching.',
		},
		scheduledFor: {
			type: ['string', 'null'],
			format: 'date-time',
			description: 'The requested send time, or null for an immediate send.',
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
			description: 'When the notification was recorded.',
		},
		dispatches: {
			type: 'array',
			description:
				'One entry per downstream provider call, keyed by channel and target. Empty for a dry run.',
			items: { $ref: '#/components/schemas/NotificationDispatchOutcome' },
		},
	},
} as const;
