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

export const articleUrlSearchParam = 'articleUrl';
export const guardianMainUrl = 'https://www.theguardian.com';

interface CopiedNotificationState {
	showReviewWarning: true;
	contentTitle: string;
}

export const createCopiedNotificationState = (
	contentTitle: string,
): CopiedNotificationState => ({
	showReviewWarning: true,
	contentTitle,
});

export const parseCopiedNotificationState = (
	state: unknown,
): CopiedNotificationState | undefined =>
	typeof state === 'object' &&
	state !== null &&
	'showReviewWarning' in state &&
	state.showReviewWarning === true &&
	'contentTitle' in state &&
	typeof state.contentTitle === 'string' &&
	state.contentTitle.trim() !== ''
		? { showReviewWarning: true, contentTitle: state.contentTitle }
		: undefined;

const isGuardianHostname = (hostname: string) =>
	hostname === 'theguardian.com' || hostname.endsWith('.theguardian.com');

export const withArticleUrl = (route: string, articleUrl: string): string => {
	const trimmedArticleUrl = articleUrl.trim();
	if (!trimmedArticleUrl) {
		return route;
	}

	let parsedArticleUrl: URL;
	try {
		parsedArticleUrl = new URL(trimmedArticleUrl, guardianMainUrl);
	} catch {
		return route;
	}
	if (!isGuardianHostname(parsedArticleUrl.hostname)) {
		return route;
	}

	const relativeArticleUrl = `${parsedArticleUrl.pathname}${parsedArticleUrl.search}${parsedArticleUrl.hash}`;
	const searchParams = new URLSearchParams({
		[articleUrlSearchParam]: relativeArticleUrl,
	});
	return `${route}?${searchParams.toString()}`;
};

export const toGuardianArticleUrl = (
	relativeArticleUrl: string | null,
): string | undefined => {
	if (!relativeArticleUrl?.startsWith('/')) {
		return undefined;
	}

	const articleUrl = new URL(relativeArticleUrl, guardianMainUrl);
	return articleUrl.origin === guardianMainUrl
		? articleUrl.toString()
		: undefined;
};

export const getAppRoutes = () => {
	return {
		dispatchLanding: '/',
		createNewsletterEmail: notificationRoutes.newsletter.create,
		newsletterEmailReport: notificationRoutes.newsletter.report,
		createAppAlert: notificationRoutes['app-push'].create,
		appAlertReport: notificationRoutes['app-push'].report,
		history: '/history',
	};
};

export const getTopBarNavigationItems = (): Array<{
	text: string;
	path: string;
	activePaths: string[];
}> => {
	const routes = getAppRoutes();

	return [
		{
			text: 'Create newsletter email',
			path: routes.createNewsletterEmail,
			activePaths: [routes.createNewsletterEmail, routes.newsletterEmailReport],
		},
		{
			text: 'Create app alert',
			path: routes.createAppAlert,
			activePaths: [routes.createAppAlert, routes.appAlertReport],
		},
		{ text: 'History', path: routes.history, activePaths: [routes.history] },
	];
};
