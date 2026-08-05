/** The `/v1/notification-tests` path item. */
export const notificationTestsPath = {
	post: {
		summary: 'Send a notification to explicit test recipients',
		description:
			'Sends immediately to direct test recipients. Segment audiences and scheduling are not accepted. A dry run validates and renders content without registering recipients or sending messages.',
		security: [{ pandaCookie: [] }],
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/NotificationTestSendRequest',
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
