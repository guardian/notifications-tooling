import { describe, expect, it } from 'bun:test';
import {
	getAppRoutes,
	getTopBarNavigationItems,
	guardianMainUrl,
	notificationRoutes,
	toGuardianArticleUrl,
	withArticleUrl,
} from './routes';

describe('notification channel routes', () => {
	it('uses channel identifiers without changing application URLs', () => {
		expect(notificationRoutes).toEqual({
			newsletter: {
				create: '/newsletter-email/create',
				report: '/newsletter-email/report',
			},
			'app-push': {
				create: '/app-alert/create',
				report: '/app-alert/report',
			},
		});
	});

	it('provides routes and navigation for each notification channel', () => {
		expect(getAppRoutes()).toEqual({
			dispatchLanding: '/',
			createNewsletterEmail: '/newsletter-email/create',
			newsletterEmailReport: '/newsletter-email/report',
			createAppAlert: '/app-alert/create',
			appAlertReport: '/app-alert/report',
			history: '/history',
		});
		expect(getTopBarNavigationItems()).toEqual([
			{
				text: 'Create newsletter email',
				path: '/newsletter-email/create',
				activePaths: ['/newsletter-email/create', '/newsletter-email/report'],
			},
			{
				text: 'Create app alert',
				path: '/app-alert/create',
				activePaths: ['/app-alert/create', '/app-alert/report'],
			},
			{ text: 'History', path: '/history', activePaths: ['/history'] },
		]);
	});
});

describe('article URL route helpers', () => {
	it('stores only the encoded relative path, query, and hash', () => {
		expect(
			withArticleUrl(
				'/app-alert/create',
				'  https://www.theguardian.com/world/example?foo=bar#block-1  ',
			),
		).toBe(
			'/app-alert/create?articleUrl=%2Fworld%2Fexample%3Ffoo%3Dbar%23block-1',
		);
	});

	it('accepts an existing relative article URL', () => {
		expect(withArticleUrl('/app-alert/create', '/world/example')).toBe(
			'/app-alert/create?articleUrl=%2Fworld%2Fexample',
		);
	});

	it('leaves a route unchanged for blank, malformed, or external URLs', () => {
		expect(withArticleUrl('/newsletter-email/create', ' ')).toBe(
			'/newsletter-email/create',
		);
		expect(
			withArticleUrl('/newsletter-email/create', 'https://example.com/x'),
		).toBe('/newsletter-email/create');
		expect(withArticleUrl('/newsletter-email/create', 'https://[')).toBe(
			'/newsletter-email/create',
		);
	});

	it('reconstructs a canonical Guardian URL from a relative value', () => {
		expect(toGuardianArticleUrl('/world/example?foo=bar#block-1')).toBe(
			`${guardianMainUrl}/world/example?foo=bar#block-1`,
		);
		expect(
			toGuardianArticleUrl('https://example.com/world/example'),
		).toBeUndefined();
		expect(toGuardianArticleUrl('//example.com/world/example')).toBeUndefined();
	});
});
