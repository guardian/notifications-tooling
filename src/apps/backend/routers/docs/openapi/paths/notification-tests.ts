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
							$ref: '#/components/schemas/NotificationResource',
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
							$ref: '#/components/schemas/NotificationResource',
						},
					},
				},
			},
			'207': {
				description:
					'The test was recorded and some, but not all, targets delivered. Each outcome is listed under `dispatches`.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationResource',
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
