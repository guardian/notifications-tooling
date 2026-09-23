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
			'Returns production send notifications created at or after the `since` cut-off (a Unix timestamp in seconds), newest first, without their dispatch outcomes. Test notifications are excluded. `search` applies a case-insensitive literal substring match to stored content-item body and title fields only. Repeated `createdByEmail` values match notifications sent by any selected user. Repeated `channel` values match any selected send channel. Repeated `audience` values match any selected newsletter audience or app-push edition. `alertType` matches any selected category. Filters combine using AND and precede pagination; `total` reports the full count of matching sends regardless of pagination. `since` defaults to 14 days ago when omitted. `limit` and `offset` are all-or-nothing: supply both or neither.',
		security: [{ pandaCookie: [] }],
		parameters: [
			{
				name: 'since',
				in: 'query',
				required: false,
				description:
					'Cut-off as a Unix timestamp in seconds. Only notifications created at or after this instant are returned. Defaults to 14 days ago when omitted.',
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
			{
				name: 'search',
				in: 'query',
				required: false,
				description:
					'Case-insensitive literal substring matched against stored content-item body and title fields only, not newsletter subjects or category metadata. Trimmed; blank or overlong values are invalid.',
				schema: { type: 'string', minLength: 1, maxLength: 200 },
			},
			{
				name: 'createdByEmail',
				in: 'query',
				required: false,
				description:
					'Repeat to match notifications sent by any selected user email (the `createdByEmail` of the notification). Matched case-insensitively. Use `GET /v1/notifications/senders` to discover the available values.',
				schema: {
					type: 'array',
					items: { type: 'string', minLength: 1, maxLength: 320 },
				},
				style: 'form',
				explode: true,
			},
			{
				name: 'channel',
				in: 'query',
				required: false,
				description: 'Repeat to match any selected send channel.',
				schema: {
					type: 'array',
					items: { type: 'string', enum: ['newsletter', 'app-push'] },
				},
				style: 'form',
				explode: true,
			},
			{
				name: 'audience',
				in: 'query',
				required: false,
				description:
					'Repeat to match any selected newsletter audience or app-push edition.',
				schema: {
					type: 'array',
					items: {
						type: 'string',
						enum: ['uk', 'us', 'au', 'europe', 'international'],
					},
				},
				style: 'form',
				explode: true,
			},
			{
				name: 'alertType',
				in: 'query',
				required: false,
				style: 'form',
				explode: true,
				description:
					'Repeat for OR matching across categories, e.g. alertType=breaking-news&alertType=exclusive. `none` matches notifications carrying no recognised kicker, and is the negation of every other category. Breaking news matches app alerts or a newsletter subject starting with Breaking news:. Exclusive matches newsletter subjects starting with Exclusive:. Newsletter prefixes are case-insensitive. Other IDs match app audience types. Omission includes all notifications, including newsletters without a recognised prefix; duplicates have no extra effect. Empty or unknown values, including alongside valid IDs, return 400.',
				schema: { $ref: '#/components/schemas/HistoryAlertTypes' },
				example: ['breaking-news', 'exclusive'],
			},
		],
		responses: {
			'200': {
				description:
					'A page of production send notifications created at or after the `since` cut-off plus the total count within that range.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/NotificationList' },
					},
				},
			},
			'400': {
				description: 'The notification list query parameters are invalid.',
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
 * The `/v1/notifications/senders` path item.
 *
 * `GET` returns the distinct sender emails (`createdByEmail`) of production
 * sends within the `since` cut-off, to populate the list endpoint's
 * `createdByEmail` filter.
 */
export const notificationSendersPath = {
	get: {
		summary: 'List distinct notification senders',
		description:
			'Returns the distinct sender emails (`createdByEmail`) of production send notifications created at or after the `since` cut-off, normalised to lowercase and alphabetically ordered. Test notifications are excluded. `since` defaults to 14 days ago when omitted. Use the returned values with the case-insensitive `createdByEmail` filter on `GET /v1/notifications`.',
		security: [{ pandaCookie: [] }],
		parameters: [
			{
				name: 'since',
				in: 'query',
				required: false,
				description:
					'Cut-off as a Unix timestamp in seconds. Only senders of notifications created at or after this instant are returned. Defaults to 14 days ago when omitted.',
				schema: { type: 'integer', minimum: 0 },
			},
		],
		responses: {
			'200': {
				description:
					'The distinct sender emails of production sends created at or after the `since` cut-off.',
				content: {
					'application/json': {
						schema: { $ref: '#/components/schemas/NotificationSenders' },
					},
				},
			},
			'400': {
				description: 'The notification senders query parameters are invalid.',
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
} as const;

/** The `/v1/notifications/article` path item. */
export const notificationArticleHistoryPath = {
	get: {
		summary: 'Find previous sends for an article',
		description:
			'Returns production sends referencing the supplied CAPI article ID or Guardian article URL, newest first, across all retained notification history. Test sends are excluded. URLs are normalised to their CAPI ID, so hosts, query parameters and fragments do not affect matching. Send timestamps are returned in UTC.',
		security: [{ pandaCookie: [] }],
		parameters: [
			{
				name: 'articleId',
				in: 'query',
				required: true,
				description:
					'The CAPI article ID or Guardian article URL. For example, `science/2026/sep/23/northern-lights`.',
				schema: { type: 'string', maxLength: 2048 },
			},
			{
				name: 'limit',
				in: 'query',
				required: false,
				description: 'Maximum sends to return. Defaults to 50.',
				schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
			},
			{
				name: 'offset',
				in: 'query',
				required: false,
				description: 'Number of matching sends to skip. Defaults to 0.',
				schema: { type: 'integer', minimum: 0, default: 0 },
			},
		],
		responses: {
			'200': {
				description: 'Previous production sends for the article.',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['articleId', 'total', 'limit', 'offset', 'sends'],
							properties: {
								articleId: { type: 'string' },
								total: { type: 'integer', minimum: 0 },
								limit: { type: 'integer', minimum: 1 },
								offset: { type: 'integer', minimum: 0 },
								sends: {
									type: 'array',
									items: {
										type: 'object',
										required: [
											'notificationId',
											'sentBy',
											'sentAt',
											'channels',
										],
										properties: {
											notificationId: { type: 'string', format: 'uuid' },
											sentBy: { type: 'string', format: 'email' },
											sentAt: {
												type: 'string',
												format: 'date-time',
												description: 'The send timestamp in UTC.',
											},
											channels: {
												type: 'array',
												items: {
													type: 'string',
													enum: ['newsletter', 'app-push'],
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			'400': {
				description: 'The article lookup parameters are invalid.',
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
