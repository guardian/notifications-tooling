import type { CapiDateTime } from '@guardian/content-api-models/v1/capiDateTime';
import type { Content } from '@guardian/content-api-models/v1/content';
import { articleFixture } from './capi-fixtures';

export const mockCapiFetch = (articleId: string): Promise<Content> => {
	return new Promise<Content>((resolve, reject) => {
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
 *
 * The JSON API returns `webPublicationDate` as a bare ISO-8601 string, whereas
 * the thrift `Content` model types it as a {@link CapiDateTime} object. Without
 * this, `content.webPublicationDate.iso8601` is `undefined` at runtime and the
 * publication date silently disappears from the UI.
 */

const toCapiDateTime = (
	webPublicationDate: unknown,
): CapiDateTime | undefined => {
	if (typeof webPublicationDate !== 'string') {
		return undefined;
	}
	return {
		dateTime: {} as CapiDateTime['dateTime'],
		iso8601: webPublicationDate,
	};
};

/**
 * TO DO - this is not intended for production use, just to demo.
 *
 * Fetching the JSON client side does not return data in the
 * same format as the thrift Content model described by content-api-models,
 * but it is similar enough for use to extract the fields we need.
 */
export const hackyClientSideCapiFetch = async (
	articleId: string,
): Promise<Content> => {
	const url = `${baseUrl}/${articleId}?${params}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`capi fetch failed: ${response.statusText}`);
	}
	const json: unknown = await response.json();

	try {
		const castJson = json as {
			response: {
				content: unknown;
				status: string;
				total: number;
			};
		};
		if (castJson.response.status !== 'ok') {
			throw new Error(`CAPI returned ${castJson.response.status} response`);
		}
		const content = castJson.response.content as Content;
		return {
			...content,
			webPublicationDate: toCapiDateTime(content.webPublicationDate),
		};
	} catch {
		throw new Error('Could not parse CAPI json');
	}
};
