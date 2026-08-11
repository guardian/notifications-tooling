import {
	type ResolveArticleRequest,
	resolveArticleResponseSchema,
	type ResolvedArticle,
} from '@models';
import { fetchJsonAndParse } from '../../../api/client';

const baseUrl = 'https://content.guardianapis.com';

export const fetchCapiDataFromApi = async (
	articleId: string,
): Promise<ResolvedArticle> => {
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

	return data.article;
};
