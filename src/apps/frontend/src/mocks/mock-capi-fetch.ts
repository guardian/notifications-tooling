import type { Content } from '@guardian/content-api-models/v1/content';
import { articleFixture } from './capi-fixtures';

export const mockCapiFetch = (articleId: string): Promise<Content> => {
	return new Promise<Content>((resolve, reject) => {
		setTimeout(() => {
			if (articleId === '/') {
				reject(new Error('no fetch logic yet'));
			} else {
				resolve(articleFixture);
			}
		}, 500);
	});
};
