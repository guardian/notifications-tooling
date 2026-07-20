/**
 * The `/v1/notifications` path item.
 *
 * The `POST` request body is registered as a named component
 * (`#/components/schemas/NotificationPushRequest`) so it can be reused and
 * inspected independently in the docs.
 */
export const notificationsPath = {
	get: {
		summary: 'List enqueued notifications',
		responses: {
			'200': { description: 'A list of enqueued notifications.' },
		},
	},
	post: {
		summary: 'Validate and enqueue a notification',
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/NotificationPushRequest' },
				},
			},
		},
		responses: {
			'202': {
				description:
					'The notification passed validation and was enqueued for per-channel dispatch.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/AcceptedNotification' },
					},
				},
			},
			'400': {
				description:
					'The request body is structurally malformed (missing/mistyped fields, unknown channel, or unexpected keys).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ValidationError' },
					},
				},
			},
			'422': {
				description:
					'The request body is well-formed but failed semantic validation (content length limits, unknown references, or cross-field rules).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/ValidationError' },
					},
				},
			},
		},
	},
} as const;
