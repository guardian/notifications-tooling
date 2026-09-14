/** The latest published Guardian articles returned from CAPI search. */
export const latestArticlesSchema = {
	type: 'object',
	required: [
		'status',
		'total',
		'startIndex',
		'pageSize',
		'currentPage',
		'pages',
		'orderBy',
		'results',
	],
	properties: {
		status: { type: 'string', example: 'ok' },
		total: { type: 'integer', minimum: 0 },
		startIndex: { type: 'integer', minimum: 0 },
		pageSize: { type: 'integer', example: 10 },
		currentPage: { type: 'integer', minimum: 1, example: 1 },
		pages: { type: 'integer', minimum: 0 },
		orderBy: { type: 'string', enum: ['newest'], example: 'newest' },
		results: {
			type: 'array',
			maxItems: 10,
			items: { $ref: '#/components/schemas/ResolvedArticle' },
		},
	},
} as const;
