/** The `202 Accepted` response returned by `POST /v1/notification-tests`. */
export const acceptedTestNotificationSchema = {
	type: 'object',
	required: ['testId', 'status', 'dryRun', 'plans', 'statusUrl'],
	properties: {
		testId: {
			type: 'string',
			format: 'uuid',
			description: 'The broker-assigned id for the accepted test send.',
		},
		status: { type: 'string', enum: ['accepted'] },
		dryRun: {
			type: 'boolean',
			description:
				'Whether the request rendered content without registering recipients or sending messages.',
		},
		plans: {
			type: 'array',
			description: 'One entry per requested test delivery channel.',
			items: { $ref: '#/components/schemas/NotificationPlanAcceptance' },
		},
		dispatches: {
			type: 'array',
			description:
				'The persisted per-target dispatch outcomes, one per addressed topic type or newsletter variant. Empty for a dry run.',
			items: { $ref: '#/components/schemas/NotificationDispatchOutcome' },
		},
		statusUrl: {
			type: 'string',
			description:
				'Reserved URL for test delivery status. The status endpoint is not implemented yet.',
			example: '/v1/notification-tests/<testId>/status',
		},
	},
} as const;
