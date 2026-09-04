import type { ResolveArticleResponse } from '@models';
import type { Result } from '../api-client/client';
import { articleFixture } from './capi-fixtures';

export const mockCapiFetch = (): Promise<Result<ResolveArticleResponse>> => {
	return new Promise<Result<ResolveArticleResponse>>((resolve) => {
		setTimeout(() => {
			resolve({
				success: true,
				data: { article: { ...articleFixture } },
			});
		}, 500);
	});
};
