import { describe, expect, it } from 'bun:test';
import {
	getAppRoutes,
	getTopBarNavigationItems,
	notificationRoutes,
} from './routes';
import { mockAppConfig } from './testing/app-config';

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

	it('preserves app-alert navigation gating and newsletter email routes', () => {
		const config = { ...mockAppConfig, DISABLE_APP_SEND_TAB: true };

		expect(getAppRoutes(config)).toEqual({
			dispatchLanding: '/',
			createNewsletterEmail: '/newsletter-email/create',
			newsletterEmailReport: '/newsletter-email/report',
			createAppAlert: undefined,
			appAlertReport: undefined,
			history: '/history',
		});
		expect(getTopBarNavigationItems(config)).toEqual([
			{
				text: 'Create newsletter email',
				path: '/newsletter-email/create',
				activePaths: ['/newsletter-email/create', '/newsletter-email/report'],
			},
			{ text: 'History', path: '/history', activePaths: ['/history'] },
		]);
	});
});
