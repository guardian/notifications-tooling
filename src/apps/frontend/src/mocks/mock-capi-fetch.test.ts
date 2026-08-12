import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { hackyClientSideCapiFetch } from './mock-capi-fetch';

afterEach(() => {
	mock.restore();
});

const capiPayload = (content: Record<string, unknown>) => ({
	response: { status: 'ok', total: 1, content },
});

const articleId =
	'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures';

describe('hackyClientSideCapiFetch', () => {
	it("converts CAPI's ISO-8601 string date into the thrift CapiDateTime shape", async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json(
				capiPayload({
					id: articleId,
					webPublicationDate: '2026-07-19T15:37:18Z',
				}),
			),
		);

		const content = await hackyClientSideCapiFetch(articleId);

		expect(content.webPublicationDate?.iso8601).toBe('2026-07-19T15:37:18Z');
	});

	it('leaves the publication date undefined when CAPI omits it', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json(capiPayload({ id: articleId })),
		);

		const content = await hackyClientSideCapiFetch(articleId);

		expect(content.webPublicationDate).toBeUndefined();
	});
});
