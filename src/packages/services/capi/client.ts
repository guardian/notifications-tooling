import { z } from 'zod';

/** A Guardian article resolved from CAPI, with the requested show-fields. */
export type ResolvedArticle = {
	articleId: string;
	url: string;
	fields: Record<string, string>;
};

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
 * The JSON REST shape of a single CAPI content item. `fields` holds whatever
 * show-fields were requested (all serialised as strings by the JSON API).
 */
const capiResponseSchema = z.object({
	response: z.object({
		status: z.string(),
		content: z.object({
			id: z.string(),
			webUrl: z.url(),
			fields: z.record(z.string(), z.string()).optional(),
		}),
	}),
});

type FetchArticleRequest = {
	endpoint: string;
	apiKey: string;
	articleId: string;
	fields: string[];
	timeoutMs: number;
};

/**
 * Resolves a Guardian article id against the Content API, returning its id, web
 * URL and the requested `show-fields`. Throws a {@link CapiError} classifying
 * the failure (`not_found`, `unavailable`, `invalid_response`).
 */
export const fetchArticle = async ({
	endpoint,
	apiKey,
	articleId,
	fields,
	timeoutMs,
}: FetchArticleRequest): Promise<ResolvedArticle> => {
	const encodedId = articleId.split('/').map(encodeURIComponent).join('/');
	const url = new URL(`/${encodedId}`, endpoint);
	url.searchParams.set('api-key', apiKey);
	if (fields.length > 0) {
		url.searchParams.set('show-fields', fields.join(','));
	}

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

	const { content } = parsed.response;
	return {
		articleId: content.id,
		url: content.webUrl,
		fields: content.fields ?? {},
	};
};
