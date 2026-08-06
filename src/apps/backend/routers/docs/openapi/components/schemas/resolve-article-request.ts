/**
 * The `POST /v1/content/articles/resolve` request body: an article reference \u2014
 * a bare CAPI content id or any Guardian article URL.
 */
export const resolveArticleRequestSchema = {
	type: 'object',
	additionalProperties: false,
	required: ['article'],
	properties: {
		article: {
			type: 'string',
			description:
				'The article to resolve, as either a bare CAPI content id (e.g. `environment/2026/jul/19/a-headline`) or any Guardian article URL: a public front-end link (`www.`/`amp.`/`m.theguardian.com`, `gu.com`) or an internal gutools preview/viewer link. The id is taken from the URL path, so the host, query string and fragment are ignored.',
			example: 'https://www.theguardian.com/environment/2026/jul/19/a-headline',
		},
	},
} as const;
