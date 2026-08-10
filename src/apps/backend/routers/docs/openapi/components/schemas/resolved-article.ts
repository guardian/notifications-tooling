/**
 * The `POST /v1/content/articles/resolve` success body (under `article`): the
 * full CAPI content item, passed through verbatim. Only `id` is guaranteed; the
 * other properties are whatever the Content API returns, including all fields
 * under `fields`.
 */
export const resolvedArticleSchema = {
	type: 'object',
	required: ['id'],
	additionalProperties: true,
	properties: {
		id: {
			type: 'string',
			description: 'The CAPI content id (the article URL pathname).',
			example: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
		},
		type: {
			type: 'string',
			description: 'The CAPI content type.',
			example: 'article',
		},
		webUrl: {
			type: 'string',
			format: 'uri',
			description: 'The canonical Guardian article URL.',
			example:
				'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
		},
		webTitle: {
			type: 'string',
			description: "The article's web title (typically the headline).",
			example: 'A rhyme to recall rising temperatures',
		},
		webPublicationDate: {
			type: 'string',
			description: 'The article web publication date, as an ISO-8601 string.',
			example: '2026-07-19T15:37:18Z',
		},
		sectionId: {
			type: 'string',
			description: "The article's section id.",
			example: 'environment',
		},
		sectionName: {
			type: 'string',
			description: "The article's section name.",
			example: 'Environment',
		},
		fields: {
			type: 'object',
			additionalProperties: { type: 'string' },
			description:
				'The CAPI content fields, as a name/value map. The endpoint requests `show-fields=all`, so every field CAPI has for the article is returned; the exact keys vary by content.',
			example: {
				headline: 'A rhyme to recall rising temperatures',
				standfirst: 'Readers respond to the week in climate news',
				byline: 'Guardian readers',
				thumbnail: 'https://media.guim.co.uk/abc/500.jpg',
				lastModified: '2026-07-19T15:40:02Z',
				wordcount: '420',
			},
		},
	},
} as const;
