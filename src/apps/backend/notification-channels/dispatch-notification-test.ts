import type { NotificationTestSendRequest } from '../routers/notifications/schemas/notification-send-request';
import {
	type AppPushTestDispatchOutcome,
	dispatchAppPushTest,
} from './app-push/dispatch-test-app-push';
import {
	dispatchNewsletterTest,
	type NewsletterTestDispatchOutcome,
} from './newsletter/dispatch-test-newsletter';
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
	// allSettled is unnecessary here: each channel already isolates its own
	// failures, so one channel's outcomes never abort the other's.
	const [newsletter, appPush] = await Promise.all([
		dispatchNewsletterTest(request, testId, dependencies),
		dispatchAppPushTest(request, testId, dependencies),
	]);

	return { newsletter, appPush };
};
