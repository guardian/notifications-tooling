import type {
	AudienceRegion,
	CapiResponse,
	CapiSearchResponse,
	IntendedAudience,
	LatestArticle,
	ProductionOffice,
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

type FetchLatestArticlesRequest = {
	endpoint: string;
	apiKey: string;
	fromDate: Date;
	toDate: Date;
	timeoutMs: number;
};

const audienceRegions: AudienceRegion[] = ['uk', 'us', 'au', 'global'];

const productionOfficeByCapiValue: Record<string, ProductionOffice> = {
	UK: 'uk',
	US: 'us',
	AUS: 'au',
};

const encodeCapiId = (articleId: string): string =>
	articleId.split('/').map(encodeURIComponent).join('/');

const deriveIntendedAudience = (
	tags: Array<{ id: string }>,
): IntendedAudience => {
	const tagIds = new Set(tags.map(({ id }) => id));
	return audienceRegions.filter((region) =>
		tagIds.has(`tracking/audience/${region}`),
	);
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
	const encodedId = encodeCapiId(articleId);
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

export const fetchLatestArticles = async ({
	endpoint,
	apiKey,
	fromDate,
	toDate,
	timeoutMs,
}: FetchLatestArticlesRequest): Promise<LatestArticle[]> => {
	const searchUrl = new URL('/search', endpoint);
	searchUrl.searchParams.set('api-key', apiKey);
	searchUrl.searchParams.set('from-date', fromDate.toISOString());
	searchUrl.searchParams.set('to-date', toDate.toISOString());
	searchUrl.searchParams.set('type', 'article|liveblog');
	searchUrl.searchParams.set('order-by', 'newest');
	searchUrl.searchParams.set('page-size', '200');
	searchUrl.searchParams.set(
		'show-fields',
		'headline,thumbnail,productionOffice',
	);
	searchUrl.searchParams.set('show-tags', 'tracking');

	const signal = AbortSignal.timeout(timeoutMs);
	const results: CapiSearchResponse['response']['results'] = [];
	let pageUrl: URL | undefined = searchUrl;

	while (pageUrl) {
		let response: Response;
		try {
			response = await fetch(pageUrl, { signal });
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

		const pageResults = parsed.response.results;
		results.push(...pageResults);
		const lastResult = pageResults.at(-1);

		if (pageResults.length < parsed.response.pageSize || !lastResult) {
			pageUrl = undefined;
		} else {
			pageUrl = new URL(
				`/content/${encodeCapiId(lastResult.id)}/next`,
				endpoint,
			);
			pageUrl.search = searchUrl.search;
		}
	}

	return results
		.flatMap(
			({
				id,
				webUrl,
				webPublicationDate,
				webTitle,
				sectionName,
				pillarId,
				pillarName,
				fields,
				tags,
			}) => {
				if (!sectionName || !webPublicationDate) {
					return [];
				}

				return [
					{
						id,
						webUrl,
						publishedAt: webPublicationDate,
						headline: fields?.headline ?? webTitle,
						section: sectionName,
						...(pillarId ? { pillarId } : {}),
						...(pillarName ? { pillarName } : {}),
						...(fields?.thumbnail ? { thumbnail: fields.thumbnail } : {}),
						...(fields?.productionOffice
							? {
									productionOffice:
										productionOfficeByCapiValue[fields.productionOffice],
								}
							: {}),
						intendedAudience: deriveIntendedAudience(tags),
					} satisfies LatestArticle,
				];
			},
		)
		.sort(
			(first, second) =>
				Date.parse(second.publishedAt) - Date.parse(first.publishedAt),
		);
};
