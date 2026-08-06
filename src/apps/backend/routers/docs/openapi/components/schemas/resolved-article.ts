/**
 * The `POST /v1/content/articles/resolve` success body (under `article`): the
 * resolved CAPI content id, canonical URL, and the requested `show-fields`.
 */
export const resolvedArticleSchema = {
	type: 'object',
	required: ['id', 'url', 'fields'],
	properties: {
		id: {
			type: 'string',
			description: 'The CAPI content id (the article URL pathname).',
			example: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
		},
		url: {
			type: 'string',
			format: 'uri',
			description: 'The canonical Guardian article URL, from CAPI.',
			example:
				'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
		},
		fields: {
			type: 'object',
			additionalProperties: { type: 'string' },
			description: 'The requested CAPI show-fields, as a name/value map.',
			example: {
				headline: 'A rhyme to recall rising temperatures',
				thumbnail: 'https://media.guim.co.uk/abc/500.jpg',
			},
		},
	},
} as const;
