import { z } from 'zod';

/** The subset of a resolved Guardian article the SPA needs to preview a link. */
export type ArticleSummary = {
	articleId: string;
	category?: string;
	publishedAt: string;
	thumbnailUrl?: string;
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
 * The JSON REST shape of a single CAPI content item. This differs from the
 * thrift `Content` model (`@guardian/content-api-models`): the JSON API returns
 * `webPublicationDate` as an ISO string rather than a `CapiDateTime` object.
 */
const capiResponseSchema = z.object({
	response: z.object({
		status: z.string(),
		content: z.object({
			id: z.string(),
			sectionName: z.string().optional(),
			webPublicationDate: z.string(),
			fields: z.object({ thumbnail: z.url() }).partial().optional(),
		}),
	}),
});

type FetchArticleRequest = {
	endpoint: string;
	apiKey: string;
	articleId: string;
	timeoutMs: number;
};

/**
 * Resolves a Guardian article id against the Content API, returning the summary
 * fields needed to preview a link. Throws a {@link CapiError} classifying the
 * failure (`not_found`, `unavailable`, `invalid_response`).
 */
export const fetchArticleSummary = async ({
	endpoint,
	apiKey,
	articleId,
	timeoutMs,
}: FetchArticleRequest): Promise<ArticleSummary> => {
	const encodedId = articleId.split('/').map(encodeURIComponent).join('/');
	const url = new URL(`/${encodedId}`, endpoint);
	url.searchParams.set('api-key', apiKey);
	url.searchParams.set('show-fields', 'thumbnail');

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
		category: content.sectionName,
		publishedAt: content.webPublicationDate,
		thumbnailUrl: content.fields?.thumbnail,
	};
};
