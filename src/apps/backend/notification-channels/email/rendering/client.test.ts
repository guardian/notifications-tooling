import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { renderEmail } from './client';

afterEach(() => {
	mock.restore();
});

describe('renderEmail', () => {
	it('renders an article using the selected newsletter id', () => {
		const timeoutSignal = new AbortController().signal;
		const timeout = spyOn(AbortSignal, 'timeout').mockReturnValue(
			timeoutSignal,
		);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ body: '<html>Rendered</html>' }),
		);

		expect(
			renderEmail({
				endpoint: 'https://email-rendering.example.com',
				articleUrl:
					'https://www.theguardian.com/world/2026/jul/22/example-story',
				newsletterId: 'breaking-news-uk',
				headlineOverride: 'Breaking news headline',
				previewText: 'A summary of the breaking news.',
				timeoutMs: 10_000,
			}),
		).resolves.toBe('<html>Rendered</html>');
		expect(timeout).toHaveBeenCalledWith(10_000);
		expect(fetcher).toHaveBeenCalledWith(
			new URL(
				'https://email-rendering.example.com/notification/world/2026/jul/22/example-story.json',
			),
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					newsletterId: 'breaking-news-uk',
					headlineOverride: 'Breaking news headline',
					previewText: 'A summary of the breaking news.',
				}),
				signal: timeoutSignal,
			},
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
				headlineOverride: 'Breaking news headline',
				previewText: 'A summary of the breaking news.',
				timeoutMs: 10_000,
			}),
		).rejects.toThrow('Email rendering failed with status 500.');
	});
});
