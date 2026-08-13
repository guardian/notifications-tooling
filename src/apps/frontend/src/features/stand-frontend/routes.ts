export const appRoutes = {
	createNewsletterEmail: '/newsletter-email/create',
	createAppAlert: '/app-alert/create',
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
