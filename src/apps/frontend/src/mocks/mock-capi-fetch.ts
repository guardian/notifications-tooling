import type { ResolveArticleResponse } from '@models';
import { articleFixture } from './capi-fixtures';

export const mockCapiFetch = (): Promise<ResolveArticleResponse> => {
	return new Promise<ResolveArticleResponse>((resolve) => {
		setTimeout(() => {
			resolve({
				article: { ...articleFixture },
			});
		}, 500);
	});
};
