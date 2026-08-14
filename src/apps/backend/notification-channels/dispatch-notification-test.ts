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

/** Per-channel test-dispatch outcomes returned for future persistence. */
export type TestDispatchOutcomes = {
	newsletter: NewsletterTestDispatchOutcome[];
	appPush: AppPushTestDispatchOutcome[];
};

export const dispatchNotificationTest = async (
	request: NotificationTestSendRequest,
	testId: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<TestDispatchOutcomes> => {
	if (request.options.dryRun) {
		return { appPush: [], newsletter: [] };
	}

	// Both channels are attempted in full (each isolates its own targets); a
	// provider rejection then surfaces as the documented 502/504 rather than a
	// false 202.
	const [newsletter, appPush] = await Promise.all([
		dispatchNewsletterTest(request, testId, dependencies),
		dispatchAppPushTest(request, testId, dependencies),
	]);

	const error = newsletter.error ?? appPush.error;
	if (error !== undefined) {
		throw error instanceof Error
			? error
			: new Error('Notification test dispatch failed.', { cause: error });
	}

	return { newsletter: newsletter.outcomes, appPush: appPush.outcomes };
};
