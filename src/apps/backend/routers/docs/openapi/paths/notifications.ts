/**
 * The `/v1/notifications` path item.
 *
 * The `POST` request body is registered as a named component
 * (`#/components/schemas/NotificationSendRequest`) so it can be reused and
 * inspected independently in the docs.
 */
export const notificationsPath = {
	post: {
		summary: 'Validate and dispatch a notification',
		description:
			'Production notification endpoint. Audiences must reference configured segments; direct email recipients are not accepted.',
		security: [{ pandaCookie: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/NotificationSendRequest' },
					examples: {
						newsletter: {
							$ref: '#/components/examples/NotificationSendNewsletter',
						},
						appPush: {
							$ref: '#/components/examples/NotificationSendAppPush',
						},
					},
				},
			},
		},
		responses: {
			'201': {
				description:
					'The notification was recorded and every requested channel delivered. The body is the stored notification with its per-target dispatch outcomes.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Notification' },
					},
				},
			},
			'202': {
				description:
					'The notification was recorded but nothing was delivered yet (a dry run). The body is the stored notification.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Notification' },
					},
				},
			},
			'207': {
				description:
					'The notification was recorded and some, but not all, targets delivered. Each outcome is listed under `dispatches`.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Notification' },
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
					'The request body is well-formed but failed semantic validation (content past the validation cap, unknown references, or cross-field rules), or the article could not be rendered.',
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
					'An upstream provider (email rendering, Braze, or the mobile-n10n app-notification service) rejected the request or returned an invalid response.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationProviderError',
						},
					},
				},
			},
			'504': {
				description:
					'An upstream provider (email rendering, Braze, or the mobile-n10n app-notification service) timed out.',
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

/**
 * The `/v1/notifications/{id}` path item.
 *
 * `GET` returns the persisted notification and its dispatch outcomes, shaped as
 * the named `#/components/schemas/Notification` component.
 */
export const notificationByIdPath = {
	get: {
		summary: 'Retrieve a persisted notification and its dispatches',
		description:
			'Returns the stored notification identified by `id`, including its per-target dispatch outcomes (oldest first).',
		security: [{ pandaCookie: [] }],
		parameters: [
			{
				name: 'id',
				in: 'path',
				required: true,
				description: 'The broker-assigned notification id (UUID).',
				schema: { type: 'string', format: 'uuid' },
			},
		],
		responses: {
			'200': {
				description: 'The notification and its dispatch outcomes.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Notification' },
					},
				},
			},
			'400': {
				description: 'The id path parameter is not a valid UUID.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationValidationError',
						},
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
			'404': { $ref: '#/components/responses/NotificationNotFound' },
		},
	},
} as const;
