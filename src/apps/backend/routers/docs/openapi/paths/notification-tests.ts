/** The `/v1/notification-tests` path item. */
export const notificationTestsPath = {
	post: {
		summary: 'Send a notification to explicit test recipients',
		description:
			'Sends immediately to direct test recipients. Segment audiences and scheduling are not accepted. For app-push, each email is resolved to its most recently active push-capable Braze profile. A dry run validates and renders content without looking up recipients or sending messages.',
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
			'202': {
				description:
					'The test notification was processed successfully. For a dry run, no recipient or message calls were made.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/AcceptedTestNotification',
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
					'The request body failed semantic validation, the article could not be rendered, or no push-capable Braze profile matched a recipient.',
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
					'An upstream provider (email rendering or Braze) rejected the request or returned an invalid response.',
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
					'An upstream provider (email rendering or Braze) timed out.',
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
