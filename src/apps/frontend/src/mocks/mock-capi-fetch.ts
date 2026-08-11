import type { ResolvedArticle } from '@models';
import { articleFixture } from './capi-fixtures';

export const mockCapiFetch = (articleId: string): Promise<ResolvedArticle> => {
	return new Promise<ResolvedArticle>((resolve, reject) => {
		setTimeout(() => {
			if (articleId === '/') {
				reject(new Error(`Could not load article with id ${articleId}`));
			} else {
				resolve({ ...articleFixture, id: articleId });
			}
		}, 500);
	});
};
