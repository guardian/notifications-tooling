import type {
	AudienceRegion,
	CapiResponse,
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
	timeoutMs: number;
};

const audienceRegions: AudienceRegion[] = ['uk', 'us', 'au', 'global'];

const productionOfficeByCapiValue: Record<string, ProductionOffice> = {
	UK: 'uk',
	US: 'us',
	AUS: 'au',
};

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

export const fetchLatestArticles = async ({
	endpoint,
	apiKey,
	fromDate,
	timeoutMs,
}: FetchLatestArticlesRequest): Promise<LatestArticle[]> => {
	const url = new URL('/search', endpoint);
	url.searchParams.set('api-key', apiKey);
	url.searchParams.set('from-date', fromDate.toISOString());
	url.searchParams.set('order-by', 'newest');
	url.searchParams.set('page-size', '200');
	url.searchParams.set('show-fields', 'headline,thumbnail,productionOffice');
	url.searchParams.set('show-tags', 'tracking');

	let response: Response;
	try {
		response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
	} catch (error) {
		throw new CapiError('unavailable', { cause: error });
	}

	if (!response.ok) {
		throw new CapiError('unavailable');
	}

	try {
		const parsed = capiSearchResponseSchema.parse(await response.json());
		return parsed.response.results
			.flatMap(
				({
					webUrl,
					webPublicationDate,
					webTitle,
					sectionName,
					fields,
					tags,
				}) => {
					if (!sectionName || !webPublicationDate) {
						return [];
					}

					return [
						{
							webUrl,
							publishedAt: webPublicationDate,
							headline: fields?.headline ?? webTitle,
							section: sectionName,
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
	} catch (error) {
		if (error instanceof CapiError) {
			throw error;
		}
		throw new CapiError('invalid_response', { cause: error });
	}
};
