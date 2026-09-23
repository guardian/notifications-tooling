/**
 * One production send referencing an article. Referenced via
 * `#/components/schemas/NotificationArticleHistorySend`.
 */
export const notificationArticleHistorySendSchema = {
	type: 'object',
	required: ['notificationId', 'sentBy', 'sentAt', 'channels'],
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
			items: { $ref: '#/components/schemas/NotificationChannel' },
		},
	},
} as const;
