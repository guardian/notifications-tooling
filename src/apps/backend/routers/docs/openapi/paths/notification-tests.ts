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
					'The request body is well-formed but failed semantic validation.',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/NotificationValidationError',
						},
					},
				},
			},
		},
	},
} as const;
