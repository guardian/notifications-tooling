import type { AppConfig } from '@models';

export const notificationRoutes = {
	email: {
		create: '/newsletter-email/create',
		report: '/newsletter-email/report',
	},
	push: {
		create: '/app-alert/create',
		report: '/app-alert/report',
	},
} as const;

export const getAppRoutes = (config: AppConfig | undefined) => {
	return {
		createNewsletterEmail: notificationRoutes.email.create,
		newsletterEmailReport: notificationRoutes.email.report,
		createAppAlert: config?.DISABLE_APP_SEND_TAB
			? undefined
			: notificationRoutes.push.create,
		appAlertReport: config?.DISABLE_APP_SEND_TAB
			? undefined
			: notificationRoutes.push.report,
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
