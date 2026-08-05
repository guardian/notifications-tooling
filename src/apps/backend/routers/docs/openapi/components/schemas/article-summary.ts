/**
 * The `POST /v1/content/link/parse` success body: the summary fields resolved
 * from CAPI that the SPA uses to preview a Guardian article link.
 */
export const articleSummarySchema = {
	type: 'object',
	required: ['articleId', 'publishedAt'],
	properties: {
		articleId: {
			type: 'string',
			description: 'The CAPI content id (the article URL pathname).',
			example: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
		},
		category: {
			type: 'string',
			description: "The article's section name.",
			example: 'Environment',
		},
		publishedAt: {
			type: 'string',
			description: 'The article web publication date, as an ISO-8601 string.',
			example: '2026-07-19T15:37:18Z',
		},
		thumbnailUrl: {
			type: 'string',
			format: 'uri',
			description: 'Optional thumbnail image URL.',
			example: 'https://media.guim.co.uk/abc/500.jpg',
		},
	},
} as const;
