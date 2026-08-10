import { z } from 'zod';

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

const capiResponseSchema = z.object({
	response: z.object({
		status: z.string(),
		content: capiContentSchema,
	}),
});

type FetchArticleRequest = {
	endpoint: string;
	apiKey: string;
	articleId: string;
	timeoutMs: number;
};

/**
 * Resolves a Guardian article id against the Content API, returning the full
 * CAPI content item (with all `show-fields`). Throws a {@link CapiError}
 * classifying the failure (`not_found`, `unavailable`, `invalid_response`).
 */
export const fetchArticle = async ({
	endpoint,
	apiKey,
	articleId,
	timeoutMs,
}: FetchArticleRequest): Promise<ResolvedArticle> => {
	const encodedId = articleId.split('/').map(encodeURIComponent).join('/');
	const url = new URL(`/${encodedId}`, endpoint);
	url.searchParams.set('api-key', apiKey);
	url.searchParams.set('show-fields', 'all');

	let response: Response;
	try {
		response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
	} catch (error) {
		throw new CapiError('unavailable', { cause: error });
	}

	if (response.status === 404) {
		throw new CapiError('not_found');
	}
	if (!response.ok) {
		throw new CapiError('unavailable');
	}

	let parsed: z.infer<typeof capiResponseSchema>;
	try {
		parsed = capiResponseSchema.parse(await response.json());
	} catch (error) {
		throw new CapiError('invalid_response', { cause: error });
	}

	return parsed.response.content;
};
