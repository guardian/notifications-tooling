import { NotificationChannel } from '@config';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import type { AppPushDispatchOutcome } from '../dispatch-outcome';
import {
	type ChannelDispatchResult,
	defaultDependencies,
	type DispatchNotificationDependencies,
	requireContentItem,
} from '../shared';
import {
	groupAppPushTopicsByType,
	sendResolvedAppPushes,
} from './dispatch-app-push';

/**
 * Sends a test app-push to the internal test topic via mobile-n10n. The schema
 * guarantees only the internal test topic can reach here, so production devices
 * are never targeted. Dry-run gating lives in the orchestrator
 * (`dispatchNotificationTest`), so reaching here always dispatches.
 */
export const dispatchAppPushTest = async (
	request: NotificationTestSendRequest,
	_testId: string,
	createdByEmail: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<ChannelDispatchResult<AppPushDispatchOutcome>> => {
	const plan = request.channels[NotificationChannel.AppPushNotification];
	if (!plan) {
		return { outcomes: [] };
	}

	const item = requireContentItem(
		request,
		plan.compose.use,
		NotificationChannel.AppPushNotification,
	);

	return sendResolvedAppPushes(
		{
			item,
			createdByEmail,
			pushes: groupAppPushTopicsByType(plan.audience.items),
		},
		dependencies,
	);
};
