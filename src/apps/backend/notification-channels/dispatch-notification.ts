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

/**
 * Per-channel dispatch outcomes returned for persistence, plus the first
 * provider rejection (if any). Both channels always run to completion; `error`
 * lets the router persist every outcome and then surface the documented 502/504.
 */
export type DispatchOutcomes = {
	appPush: AppPushDispatchOutcome[];
	newsletter: NewsletterDispatchOutcome[];
	error?: unknown;
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

	// Both channels are attempted in full (each isolates its own targets via
	// allSettled); outcomes are returned for future persistence. Nothing is
	// retried automatically, so a re-send must not resend targets that succeeded.
	const [newsletter, appPush] = await Promise.all([
		dispatchNewsletter(newsletterDispatch, notificationId, dependencies),
		dispatchAppPush(appPushDispatch, notificationId, dependencies),
	]);

	// Both channels ran to completion; the first provider rejection (if any) is
	// returned so the router can persist every outcome before surfacing it as the
	// documented 502/504 (via errorMiddleware) rather than a false 202.
	return {
		appPush: appPush.outcomes,
		newsletter: newsletter.outcomes,
		error: newsletter.error ?? appPush.error,
	};
};
