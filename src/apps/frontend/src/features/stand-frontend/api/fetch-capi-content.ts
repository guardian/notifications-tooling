import {
	type ResolveArticleRequest,
	type ResolveArticleResponse,
	resolveArticleResponseSchema,
} from '@models';
import { fetchJsonAndParse } from '../../../api/client';

export const fetchCapiDataFromApi = async (
	request: ResolveArticleRequest,
): Promise<ResolveArticleResponse> => {
	return await fetchJsonAndParse(
		resolveArticleResponseSchema,
		'/v1/content/articles/resolve',
		{
			method: 'POST',
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
		},
	);
};
