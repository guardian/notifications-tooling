import type {
	CapiResponse,
	CapiSearchResponse,
	CapiSearchResult,
	ResolvedArticle,
} from '@models';
import {
	CapiError,
	capiResponseSchema,
	capiSearchResponseSchema,
} from '@models';

type FetchArticleRequest = {
	endpoint: string;
	apiKey: string;
	articleId: string;
	timeoutMs: number;
};

type SearchLatestArticlesRequest = {
	endpoint: string;
	apiKey: string;
	timeoutMs: number;
	query?: string;
	section?: string;
	page?: number;
	pageSize?: number;
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
	url.searchParams.set('show-blocks', 'all');

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

	let parsed: CapiResponse;
	try {
		parsed = capiResponseSchema.parse(await response.json());
	} catch (error) {
		throw new CapiError('invalid_response', { cause: error });
	}

	return parsed.response.content;
};

/**
 * Searches CAPI for articles ordered by their published date, newest first.
 * The response includes CAPI pagination metadata as well as the matching items.
 */
export const searchLatestArticles = async ({
	endpoint,
	apiKey,
	timeoutMs,
	query,
	section,
	page = 1,
	pageSize = 20,
}: SearchLatestArticlesRequest): Promise<CapiSearchResult> => {
	if (!Number.isInteger(page) || page < 1) {
		throw new RangeError('page must be a positive integer.');
	}
	if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
		throw new RangeError('pageSize must be an integer between 1 and 50.');
	}

	const url = new URL('/search', endpoint);
	url.searchParams.set('api-key', apiKey);
	url.searchParams.set('order-by', 'newest');
	url.searchParams.set('order-date', 'published');
	url.searchParams.set('show-fields', 'all');
	url.searchParams.set('page', String(page));
	url.searchParams.set('page-size', String(pageSize));
	if (query?.trim()) {
		url.searchParams.set('q', query.trim());
	}
	if (section?.trim()) {
		url.searchParams.set('section', section.trim());
	}

	let response: Response;
	try {
		response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
	} catch (error) {
		throw new CapiError('unavailable', { cause: error });
	}

	if (!response.ok) {
		throw new CapiError('unavailable');
	}

	let parsed: CapiSearchResponse;
	try {
		parsed = capiSearchResponseSchema.parse(await response.json());
	} catch (error) {
		throw new CapiError('invalid_response', { cause: error });
	}

	return parsed.response;
};
