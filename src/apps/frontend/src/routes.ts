import type { AppConfig } from '@models';

export const notificationRoutes = {
	newsletter: {
		create: '/newsletter-email/create',
		report: '/newsletter-email/report',
	},
	'app-push': {
		create: '/app-alert/create',
		report: '/app-alert/report',
	},
} as const;

export const getAppRoutes = (config: AppConfig | undefined) => {
	return {
		dispatchLanding: '/',
		createNewsletterEmail: notificationRoutes.newsletter.create,
		newsletterEmailReport: notificationRoutes.newsletter.report,
		createAppAlert: config?.DISABLE_APP_SEND_TAB
			? undefined
			: notificationRoutes['app-push'].create,
		appAlertReport: config?.DISABLE_APP_SEND_TAB
			? undefined
			: notificationRoutes['app-push'].report,
		history: '/history',
	};
};

export const getTopBarNavigationItems = (
	config: AppConfig | undefined,
): Array<{ text: string; path: string; activePaths: string[] }> => {
	const routes = getAppRoutes(config);

	return [
		{
			text: 'Create newsletter email',
			path: routes.createNewsletterEmail,
			activePaths: [routes.createNewsletterEmail, routes.newsletterEmailReport],
		},
		!routes.createAppAlert
			? []
			: {
					text: 'Create app alert',
					path: routes.createAppAlert,
					activePaths: [routes.createAppAlert, routes.appAlertReport!],
				},
		{ text: 'History', path: routes.history, activePaths: [routes.history] },
	].flat();
};
