import z from 'zod';

/**
 * Body for `POST /v1/content/articles/resolve`: an article reference — a bare
 * article id or any Guardian article URL.
 */
export const resolveArticleRequestSchema = z.strictObject({
	article: z.string().trim().min(1).meta({
		description:
			'The article to resolve, as either a bare CAPI content id (e.g. `environment/2026/jul/19/a-headline`) or any Guardian article URL: a public front-end link (`www.`/`amp.`/`m.theguardian.com`, `gu.com`) or an internal gutools preview/viewer link. The id is taken from the URL path, so the host, query string and fragment are ignored.',
		example: 'https://www.theguardian.com/environment/2026/jul/19/a-headline',
	}),
});

export type ResolveArticleRequest = z.infer<typeof resolveArticleRequestSchema>;

export type CapiFailureReason =
	'not_found' | 'unavailable' | 'invalid_response';

/** A classified failure talking to the Content API. */
export class CapiError extends Error {
	constructor(
		readonly reason: CapiFailureReason,
		options?: ErrorOptions,
	) {
		const message = (() => {
			switch (reason) {
				case 'not_found':
					return 'The article could not be found.';
				case 'unavailable':
					return 'The Content API could not be reached.';
				case 'invalid_response':
					return 'The Content API returned an unexpected response.';
			}
		})();

		super(message, options);
		this.name = 'CapiError';
	}
}

/**
 * A single CAPI content item, passed through verbatim. Only `id` is asserted;
 * every other field the JSON API returns (type, section, webUrl, webTitle,
 * publication date, tags, and the requested `fields`) is preserved.
 */
const capiContentSchema = z.looseObject({ id: z.string() });

/** The full CAPI content item for the resolved article. */
export type ResolvedArticle = z.infer<typeof capiContentSchema>;

export const capiResponseSchema = z.object({
	response: z.object({
		status: z.string(),
		content: capiContentSchema,
	}),
});

export const resolveArticleResponseSchema = z.object({
	article: capiContentSchema,
});
export type ResolveArticleResponse = z.infer<
	typeof resolveArticleResponseSchema
>;
