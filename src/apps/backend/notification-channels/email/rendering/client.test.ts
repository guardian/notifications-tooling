import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { renderEmail } from './client';

afterEach(() => {
	mock.restore();
});

describe('renderEmail', () => {
	it('renders an article using the selected newsletter id', () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ body: '<html>Rendered</html>' }),
		);

		expect(
			renderEmail({
				endpoint: 'https://email-rendering.example.com',
				articleUrl:
					'https://www.theguardian.com/world/2026/jul/22/example-story',
				newsletterId: 'breaking-news-uk',
			}),
		).resolves.toBe('<html>Rendered</html>');
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://email-rendering.example.com/notification/world/2026/jul/22/example-story.json?newsletter-id=breaking-news-uk',
			),
		);
	});

	it('throws a safe error when rendering fails', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('sensitive response', { status: 500 }),
		);

		expect(
			renderEmail({
				endpoint: 'https://email-rendering.example.com',
				articleUrl: 'https://www.theguardian.com/world/example-story',
				newsletterId: 'breaking-news-uk',
			}),
		).rejects.toThrow('Email rendering failed with status 500.');
	});
});
