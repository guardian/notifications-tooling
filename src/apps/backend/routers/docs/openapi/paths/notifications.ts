/**
 * The `/v1/notifications` path item.
 *
 * The `POST` request body is registered as a named component
 * (`#/components/schemas/NotificationSendRequest`) so it can be reused and
 * inspected independently in the docs.
 */
export const notificationsPath = {
	get: {
		summary: 'List recent notifications',
		description:
			'Returns notifications created at or after the required `since` cut-off (a Unix timestamp in seconds), newest first, without their dispatch outcomes. `total` reports the full count at or after that cut-off regardless of pagination. `limit` and `offset` are all-or-nothing: supply both or neither.',
		security: [{ pandaCookie: [] }],
		parameters: [
			{
				name: 'since',
				in: 'query',
				required: true,
				description:
					'Cut-off as a Unix timestamp in seconds. Only notifications created at or after this instant are returned.',
				schema: { type: 'integer', minimum: 0 },
			},
			{
				name: 'limit',
				in: 'query',
				required: false,
				description:
					'Maximum number of notifications to return. Defaults to 10; must be sent together with `offset`.',
				schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
			},
			{
				name: 'offset',
				in: 'query',
				required: false,
				description:
					'Number of notifications to skip before the page. Defaults to 0; must be sent together with `limit`. An offset past the end of the range returns an empty page.',
				schema: { type: 'integer', minimum: 0, default: 0 },
			},
		],
		responses: {
			'200': {
				description:
					'A page of notifications created at or after the `since` cut-off plus the total count within that range.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/NotificationList' },
					},
				},
			},
			'400': {
				description: 'The pagination query parameters are invalid.',
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
		},
	},
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
					'The request body is well-formed but failed semantic validation (content past the validation cap, unknown references, or cross-field rules).',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationUnprocessableError',
						},
					},
				},
			},
			'409': { $ref: '#/components/responses/IdempotencyKeyConflict' },
			'502': {
				description:
					'At least one target failed — whether at an upstream provider (email rendering, Braze, or the mobile-n10n app-notification service) or before any outcome could be recorded — a partial or total failure is treated as a failure. The body is the stored notification with its per-target `dispatches` (empty when the failure occurred before anything could be recorded).',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/Notification' },
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
