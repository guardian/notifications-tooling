import { randomUUID } from 'node:crypto';
import {
	AppPushImportance,
	NotificationChannel,
	resolveAppPushTopic,
} from '@config';
import {
	AppNotificationApiError,
	type AppNotificationFailureReason,
	type AppNotificationImportance,
} from '@services';
import { determineArticleId } from '@utils';
import { z } from 'zod';
import type { NotificationSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import {
	type DispatchNotificationDependencies,
	PROVIDER_REQUEST_TIMEOUT_MS,
	requireContentItem,
} from '../shared';

const appNotificationEnvironmentSchema = z.object({
	MOBILE_N10N_ENDPOINT: z.url(),
	MOBILE_N10N_API_KEY: z.string().trim().min(1),
});

/**
 * The outcome of one mobile-n10n push (one per targeted topic type). Returned so
 * the caller can persist each POST's id and status once a store exists.
 */
export type AppPushDispatchOutcome = {
	notificationId: string;
	id: string;
	topicType: string;
	status: 'success' | 'failure';
	failureReason?: AppNotificationFailureReason | 'unknown';
};

export const resolveAppPushDispatch = (request: NotificationSendRequest) => {
	const plan = request.channels[NotificationChannel.AppPushNotification];
	if (!plan) {
		return;
	}

	const item = requireContentItem(
		request,
		plan.compose.use,
		NotificationChannel.AppPushNotification,
	);

	// One push per topic type: each type carries a single importance, so grouping
	// by type keeps every push's importance unambiguous — no collapsing needed.
	const pushesByTopicType = new Map<
		string,
		{
			topicType: string;
			importance: AppNotificationImportance;
			topics: Array<{ type: string; name: string }>;
		}
	>();
	for (const { type, name } of plan.audience.items) {
		const resolved = resolveAppPushTopic(type, name);
		if (!resolved) {
			throw new Error(
				`No push topic is configured for topic type '${type}' edition '${name}'.`,
			);
		}
		const push = pushesByTopicType.get(type) ?? {
			topicType: type,
			importance:
				resolved.importance === AppPushImportance.Major ? 'Major' : 'Minor',
			topics: [],
		};
		push.topics.push(resolved.topic);
		pushesByTopicType.set(type, push);
	}

	return {
		item,
		sender: request.sender,
		pushes: [...pushesByTopicType.values()],
	};
};

export const dispatchAppPush = async (
	resolvedDispatch: ReturnType<typeof resolveAppPushDispatch>,
	notificationId: string,
	dependencies: DispatchNotificationDependencies,
): Promise<AppPushDispatchOutcome[]> => {
	if (!resolvedDispatch) {
		return [];
	}

	const { item, sender, pushes } = resolvedDispatch;

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
				sender,
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

	return settled.map((result, index): AppPushDispatchOutcome => {
		const { id, push } = dispatched[index]!;
		if (result.status === 'fulfilled') {
			return {
				notificationId,
				id,
				topicType: push.topicType,
				status: 'success',
			};
		}
		return {
			notificationId,
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
