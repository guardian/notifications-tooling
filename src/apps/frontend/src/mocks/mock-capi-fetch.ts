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

const baseUrl = 'https://content.guardianapis.com';
const params = 'api-key=test&show-fields=headline,standfirst,thumbnail';

/**
 * TO DO - this is not intended for production use, just to demo.
 */
export const hackyClientSideCapiFetch = async (
	articleId: string,
): Promise<ResolvedArticle> => {
	const url = `${baseUrl}/${articleId}?${params}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`capi fetch failed: ${response.statusText}`);
	}
	const json: unknown = await response.json();

	try {
		const castJson = json as {
			response: {
				content: ResolvedArticle;
				status: string;
				total: number;
			};
		};
		if (castJson.response.status !== 'ok') {
			throw new Error(`CAPI returned ${castJson.response.status} response`);
		}
		return castJson.response.content;
	} catch {
		throw new Error('Could not parse CAPI json');
	}
};
