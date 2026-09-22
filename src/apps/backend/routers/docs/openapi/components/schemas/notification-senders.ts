/**
 * The `GET /v1/notifications/senders` response: the distinct sender emails
 * (`createdByEmail`) of production sends within the requested `since` cut-off,
 * alphabetically ordered. Referenced via `#/components/schemas/NotificationSenders`.
 */
export const notificationSendersSchema = {
	type: 'object',
	required: ['senders'],
	properties: {
		senders: {
			type: 'array',
			description:
				'The distinct sender emails of production sends created at or after the `since` cut-off, normalised to lowercase and alphabetically ordered.',
			items: { type: 'string', format: 'email' },
		},
	},
} as const;
