export const appRoutes = {
	createNewsletterEmail: '/create-newsletter-email',
	createAppAlert: '/create-app-alert',
	history: '/history',
} as const;

export const topBarNavigationItems = [
	{
		text: 'Create newsletter email',
		path: appRoutes.createNewsletterEmail,
	},
	{
		text: 'Create app alert',
		path: appRoutes.createAppAlert,
	},
	{ text: 'History', path: appRoutes.history },
] as const;
