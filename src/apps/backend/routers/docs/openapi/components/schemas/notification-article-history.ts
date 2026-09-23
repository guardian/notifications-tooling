/**
 * The paginated article notification lookup response. Referenced via
 * `#/components/schemas/NotificationArticleHistory`.
 */
export const notificationArticleHistorySchema = {
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
				$ref: '#/components/schemas/NotificationArticleHistorySend',
			},
		},
	},
} as const;
