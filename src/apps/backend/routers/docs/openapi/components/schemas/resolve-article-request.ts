/**
 * The `POST /v1/content/articles/resolve` request body: an article reference (a
 * bare CAPI content id or any Guardian article URL) and the CAPI `show-fields`
 * to return for it.
 */
export const resolveArticleRequestSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['article', 'showFields'],
	properties: {
		article: {
			type: 'string',
			description:
				'The article to resolve, as either a bare CAPI content id (e.g. `environment/2026/jul/19/a-headline`) or any Guardian article URL: a public front-end link (`www.`/`amp.`/`m.theguardian.com`, `gu.com`) or an internal gutools preview/viewer link. The id is taken from the URL path, so the host, query string and fragment are ignored.',
			example: 'https://www.theguardian.com/environment/2026/jul/19/a-headline',
		},
		showFields: {
			type: 'array',
			items: { type: 'string' },
			description:
				'CAPI `show-fields` names to return for the article (letters only, e.g. `headline`, `standfirst`, `thumbnail`, `trailText`). Only the requested fields are returned, under `article.fields`.',
			example: ['headline', 'thumbnail', 'trailText'],
		},
	},
} as const;
