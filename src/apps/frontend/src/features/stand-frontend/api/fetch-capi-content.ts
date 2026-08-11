import type { CapiDateTime } from '@guardian/content-api-models/v1/capiDateTime';
import type { Content } from '@guardian/content-api-models/v1/content';
import {
	type ResolveArticleRequest,
	resolveArticleResponseSchema,
	type ResolvedArticle,
} from '@models';
import { fetchJsonAndParse } from '../../../api/client';

const baseUrl = 'https://content.guardianapis.com';

// TO DO - either change the backend to fetch the thrift model
// or do not use @guardian/content-api-models on the frontend
const toCapiDateTime = (
	webPublicationDate?: string,
): CapiDateTime | undefined => {
	if (typeof webPublicationDate !== 'string') {
		return undefined;
	}
	return {
		dateTime: {} as CapiDateTime['dateTime'],
		iso8601: webPublicationDate,
	};
};

export const fetchCapiDataFromApi = async (
	articleId: string,
): Promise<Content> => {
	const request: ResolveArticleRequest = {
		article: `${baseUrl}/${articleId}`,
	};

	const data = await fetchJsonAndParse(
		resolveArticleResponseSchema,
		'/v1/content/articles/resolve',
		{
			method: 'POST',
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
		},
	);

	const article: ResolvedArticle = data.article;

	return {
		...article,
		webPublicationDate: toCapiDateTime(article.webPublicationDate),
	} as unknown as Content;
};
