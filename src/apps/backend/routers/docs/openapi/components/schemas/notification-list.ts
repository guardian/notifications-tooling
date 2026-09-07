/**
 * The paginated `GET /v1/notifications` response: a page of production send
 * notifications created at or after the requested `since` cut-off plus the total
 * count within that range. Test notifications are excluded. Referenced via
 * `#/components/schemas/NotificationList`.
 */
export const notificationListSchema = {
	type: 'object',
	required: ['total', 'limit', 'offset', 'notifications'],
	properties: {
		total: {
			type: 'integer',
			description:
				'The number of production send notifications created at or after the `since` cut-off, ignoring pagination.',
		},
		limit: {
			type: 'integer',
			description: 'The applied page size.',
		},
		offset: {
			type: 'integer',
			description: 'The applied row offset.',
		},
		notifications: {
			type: 'array',
			description:
				'The page of production send notifications, newest first. Dispatch outcomes are not included.',
			items: { $ref: '#/components/schemas/NotificationSummary' },
		},
	},
} as const;
