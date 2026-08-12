import type { NotificationSendRequest } from '../routers/notifications/schemas/notification-send-request';
import {
	type AppPushDispatchOutcome,
	dispatchAppPush,
	resolveAppPushDispatch,
} from './app-push/dispatch-app-push';
import {
	dispatchNewsletter,
	type NewsletterDispatchOutcome,
	resolveNewsletterDispatch,
} from './newsletter/dispatch-newsletter';
import {
	defaultDependencies,
	type DispatchNotificationDependencies,
} from './shared';

/** Per-channel dispatch outcomes returned for future persistence. */
export type DispatchOutcomes = {
	appPush: AppPushDispatchOutcome[];
	newsletter: NewsletterDispatchOutcome[];
};

export const dispatchNotification = async (
	request: NotificationSendRequest,
	notificationId: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<DispatchOutcomes> => {
	if (request.options.dryRun) {
		return { appPush: [], newsletter: [] };
	}

	if (request.options.scheduledFor) {
		throw new Error('Scheduled delivery is not implemented.');
	}

	const newsletterDispatch = resolveNewsletterDispatch(request);
	const appPushDispatch = resolveAppPushDispatch(request);

	// Per-channel outcomes are returned for future persistence; nothing is
	// retried automatically, so a re-send must not resend targets that succeeded.
	const [newsletter, appPush] = await Promise.all([
		dispatchNewsletter(newsletterDispatch, notificationId, dependencies),
		dispatchAppPush(appPushDispatch, notificationId, dependencies),
	]);

	return { appPush, newsletter };
};
