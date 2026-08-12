import { randomUUID } from 'node:crypto';
import { NotificationChannel } from '@config';
import {
	AppNotificationApiError,
	type AppNotificationFailureReason,
} from '@services';
import { determineArticleId } from '@utils';
import { z } from 'zod';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import {
	defaultDependencies,
	type DispatchNotificationDependencies,
	PROVIDER_REQUEST_TIMEOUT_MS,
	requireContentItem,
} from '../shared';
import { groupAppPushTopicsByType } from './dispatch-app-push';

const appNotificationEnvironmentSchema = z.object({
	MOBILE_N10N_ENDPOINT: z.url(),
	MOBILE_N10N_API_KEY: z.string().trim().min(1),
});

/**
 * The outcome of one test push to the internal test topic (one per topic type).
 * `id` is the mobile-n10n POST id, kept for tracking once a store exists.
 */
export type AppPushTestDispatchOutcome = {
	testId: string;
	id: string;
	topicType: string;
	status: 'success' | 'failure';
	failureReason?: AppNotificationFailureReason | 'unknown';
};

/**
 * Sends a test app-push to the internal test topic via mobile-n10n. The schema
 * guarantees only the internal test topic can reach here, so production devices
 * are never targeted. A dry run resolves the topics but sends nothing.
 */
export const dispatchAppPushTest = async (
	request: NotificationTestSendRequest,
	testId: string,
	dependencies: DispatchNotificationDependencies = defaultDependencies,
): Promise<AppPushTestDispatchOutcome[]> => {
	const plan = request.channels[NotificationChannel.AppPushNotification];
	if (!plan) {
		return [];
	}

	const item = requireContentItem(
		request,
		plan.compose.use,
		NotificationChannel.AppPushNotification,
	);
	const pushes = groupAppPushTopicsByType(plan.audience.items);

	if (request.options.dryRun) {
		return [];
	}

	const [endpoint, apiKey] = await Promise.all([
		dependencies.getSSMParameter('MOBILE_N10N_ENDPOINT'),
		dependencies.getSSMParameter('MOBILE_N10N_API_KEY'),
	]);

	const environment = appNotificationEnvironmentSchema.parse({
		MOBILE_N10N_ENDPOINT: endpoint,
		MOBILE_N10N_API_KEY: apiKey,
	});

	// Derive the CAPI content id so the apps deep-link; falls back to the raw URL.
	const contentApiId = determineArticleId(item.link);

	// A fresh id per topic-type push; returned so each POST can be persisted.
	const dispatched = pushes.map((push) => ({ id: randomUUID(), push }));

	// allSettled so one failed push does not abort the others.
	const settled = await Promise.allSettled(
		dispatched.map(({ id, push }) =>
			dependencies.sendAppNotification({
				endpoint: environment.MOBILE_N10N_ENDPOINT,
				apiKey: environment.MOBILE_N10N_API_KEY,
				timeoutMs: PROVIDER_REQUEST_TIMEOUT_MS,
				id,
				sender: request.sender,
				title: item.title,
				body: item.body,
				link: item.link,
				contentApiId,
				importance: push.importance,
				topics: push.topics,
				media: item.media,
			}),
		),
	);

	return settled.map((result, index): AppPushTestDispatchOutcome => {
		const { id, push } = dispatched[index]!;
		if (result.status === 'fulfilled') {
			return {
				testId,
				id,
				topicType: push.topicType,
				status: 'success',
			};
		}
		return {
			testId,
			id,
			topicType: push.topicType,
			status: 'failure',
			failureReason:
				result.reason instanceof AppNotificationApiError
					? result.reason.reason
					: 'unknown',
		};
	});
};
