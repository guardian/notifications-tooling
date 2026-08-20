import type { AppConfig } from '@models';

export const getAppRoutes = (config: AppConfig | undefined) => {
	return {
		createNewsletterEmail: '/newsletter-email/create',
		createAppAlert: config?.DISABLE_APP_SEND_TAB
			? undefined
			: '/app-alert/create',
		history: '/history',
	};
};

export const getTopBarNavigationItems = (
	config: AppConfig | undefined,
): Array<{ text: string; path: string }> => {
	const routes = getAppRoutes(config);

	return [
		{
			text: 'Create newsletter email',
			path: routes.createNewsletterEmail,
		},
		!routes.createAppAlert
			? []
			: {
					text: 'Create app alert',
					path: routes.createAppAlert,
				},
		{ text: 'History', path: routes.history },
	].flat();
};
