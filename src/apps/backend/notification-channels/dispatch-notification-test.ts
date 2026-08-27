import type { NotificationTestSendRequest } from '../routers/notifications/schemas/notification-send-request';
import {
	type AppPushTestDispatchOutcome,
	dispatchAppPushTest,
} from './app-push/dispatch-app-push-test';
import {
	dispatchNewsletterTest,
	type NewsletterTestDispatchOutcome,
} from './newsletter/dispatch-newsletter-test';
import {
	defaultDependencies,
	type DispatchNotificationDependencies,
} from './shared';

/**
 * Per-channel test-dispatch outcomes returned for persistence, plus the first
 * provider rejection (if any). Both channels always run to completion; `error`
 * lets the router persist every outcome and then surface the documented 502/504.
 */
export type TestDispatchOutcomes = {
	newsletter: NewsletterTestDispatchOutcome[];
	appPush: AppPushTestDispatchOutcome[];
	error?: unknown;
};

export const dispatchNotificationTest = async (
	request: NotificationTestSendRequest,
	testId: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<TestDispatchOutcomes> => {
	if (request.options.dryRun) {
		return { appPush: [], newsletter: [] };
	}

	// Both channels are attempted in full (each isolates its own targets); the
	// first provider rejection (if any) is returned so the router can persist
	// every outcome before surfacing it as the documented 502/504 rather than a
	// false 202.
	const [newsletter, appPush] = await Promise.all([
		dispatchNewsletterTest(request, testId, dependencies),
		dispatchAppPushTest(request, testId, dependencies),
	]);

	return {
		newsletter: newsletter.outcomes,
		appPush: appPush.outcomes,
		error: newsletter.error ?? appPush.error,
	};
};
