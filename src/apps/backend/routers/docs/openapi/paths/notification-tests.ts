/** The `/v1/notification-tests` path item. */
export const notificationTestsPath = {
	post: {
		summary: 'Send a notification to explicit test recipients',
		description:
			'Sends immediately to direct test recipients. Segment audiences and scheduling are not accepted. App-push tests may only target the internal test topic. A dry run validates and renders content without registering recipients or sending messages.',
		security: [{ pandaCookie: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/NotificationTestSendRequest',
					},
					examples: {
						newsletter: {
							$ref: '#/components/examples/NotificationTestNewsletter',
						},
						appPush: {
							$ref: '#/components/examples/NotificationTestAppPush',
						},
					},
				},
			},
		},
		responses: {
			'201': {
				description:
					'The test was recorded and every requested channel delivered. The body is the stored notification with its per-target dispatch outcomes.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Notification',
						},
					},
				},
			},
			'202': {
				description:
					'The test was recorded but nothing was delivered yet (a dry run): no recipient or message calls were made and no dispatches are recorded. The body is the stored notification.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Notification',
						},
					},
				},
			},
			'401': { $ref: '#/components/responses/Unauthenticated' },
			'403': { $ref: '#/components/responses/InsufficientPermissions' },
			'400': {
				description:
					'The request body is structurally malformed or uses a production segment audience.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationValidationError',
						},
					},
				},
			},
			'422': {
				description: 'The request body failed semantic validation.',
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
