import type { Content } from '@guardian/content-api-models/v1/content';
import {
	type ResolveArticleRequest,
	resolveArticleResponseSchema,
} from '@models';
import { fetchJsonAndParse } from '../../../api/client';

const baseUrl = 'https://content.guardianapis.com';

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

	return data.article as unknown as Content;
};
