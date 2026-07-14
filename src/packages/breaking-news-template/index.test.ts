import { describe, expect, it } from 'bun:test';
import {
	DEFAULT_BREAKING_NEWS_IMAGE,
	renderBreakingNewsTemplate,
	withBrazeUtm,
} from './index';

const article = {
	body: 'Body <copy>',
	headline: 'Headline & more',
	imageUrl: '',
	subject: 'Breaking news: Headline',
	url: 'https://www.theguardian.com/world/2026/jul/10/story?existing=1',
};

describe('breaking news template', () => {
	it('renders escaped article content into the explicit template fields', () => {
		const html = renderBreakingNewsTemplate(article, {
			includePreviewMarkers: true,
			now: new Date('2026-07-10T12:00:00Z'),
		});

		expect(html).toContain('<title>Breaking news: Headline</title>');
		expect(html).toContain('Fri, Jul 10, 2026');
		expect(html).toContain('Headline &amp; more');
		expect(html).toContain('Body &lt;copy&gt;');
		expect(html).toContain(
			DEFAULT_BREAKING_NEWS_IMAGE.replaceAll('&', '&amp;'),
		);
		expect(html).toContain('data-preview="headline"');
		expect(html).toContain('data-preview="body"');
		expect(html).toContain('data-preview="image"');
		expect(html).not.toContain('{{');
	});

	it('adds the Braze tracking token without changing existing query parameters', () => {
		expect(withBrazeUtm(article.url)).toBe(
			'https://www.theguardian.com/world/2026/jul/10/story?existing=1&##braze_utm##',
		);
	});
});
