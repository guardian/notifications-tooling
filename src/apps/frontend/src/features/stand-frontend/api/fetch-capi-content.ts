import {
	type ResolveArticleRequest,
	type ResolveArticleResponse,
	resolveArticleResponseSchema,
} from '@models';
import type { Result } from '../../../api/client';
import { safeFetchJsonAndParse } from '../../../api/client';

export const fetchCapiDataFromApi = (
	request: ResolveArticleRequest,
): Promise<Result<ResolveArticleResponse>> =>
	safeFetchJsonAndParse(
		resolveArticleResponseSchema,
		'/v1/content/articles/resolve',
		{
			method: 'POST',
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
		},
	);
