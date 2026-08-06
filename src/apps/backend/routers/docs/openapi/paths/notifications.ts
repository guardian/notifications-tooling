/**
 * The `/v1/notifications` path item.
 *
 * The `POST` request body is registered as a named component
 * (`#/components/schemas/NotificationSendRequest`) so it can be reused and
 * inspected independently in the docs.
 */
export const notificationsPath = {
	post: {
		summary: 'Validate and enqueue a notification',
		description:
			'Production notification endpoint. Audiences must reference configured segments; direct email recipients are not accepted.',
		security: [{ pandaCookie: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/NotificationSendRequest' },
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
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
			'400': {
				description:
					'The request body is structurally malformed (missing/mistyped fields, unknown channel, or unexpected keys).',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationValidationError',
						},
					},
				},
			},
			'422': {
				description:
					'The request body failed semantic validation or the article could not be rendered.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationUnprocessableError',
						},
					},
				},
			},
			'502': {
				description:
					'Braze or email rendering rejected the request or returned an invalid response.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationProviderError',
						},
					},
				},
			},
			'504': {
				description: 'Braze or email rendering timed out.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationProviderError',
						},
					},
				},
			},
		},
	},
} as const;
