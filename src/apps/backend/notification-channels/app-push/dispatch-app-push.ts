import { randomUUID } from 'node:crypto';
import {
	type AppPushTestTopicTypeId,
	type AppPushTopicTypeId,
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
	type ChannelDispatchResult,
	type DispatchNotificationDependencies,
	firstSettledError,
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

/** One resolved push: a topic type, its importance, and its mobile-n10n topics. */
export type ResolvedAppPush = {
	topicType: string;
	importance: AppNotificationImportance;
	topics: Array<{ type: string; name: string }>;
};

/**
 * Groups selected topic-type/edition pairs into one push per topic type. Each
 * type carries a single importance, so grouping by type keeps every push's
 * importance unambiguous. Throws if a pair has no configured topic. Shared by the
 * production and internal-test push flows.
 */
export const groupAppPushTopicsByType = (
	items: ReadonlyArray<{
		type: AppPushTopicTypeId | AppPushTestTopicTypeId;
		name: string;
	}>,
): ResolvedAppPush[] => {
	const pushesByTopicType = new Map<string, ResolvedAppPush>();
	for (const { type, name } of items) {
		const resolved = resolveAppPushTopic(type, name);
		if (!resolved) {
			throw new Error(
				`No push topic is configured for topic type '${type}' edition '${name}'.`,
			);
		}
		const push = pushesByTopicType.get(type) ?? {
			topicType: type,
			importance: resolved.importance,
			topics: [],
		};
		push.topics.push(resolved.topic);
		pushesByTopicType.set(type, push);
	}
	return [...pushesByTopicType.values()];
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

	return {
		item,
		sender: request.sender,
		pushes: groupAppPushTopicsByType(plan.audience.items),
	};
};

export const dispatchAppPush = async (
	resolvedDispatch: ReturnType<typeof resolveAppPushDispatch>,
	notificationId: string,
	dependencies: DispatchNotificationDependencies,
): Promise<ChannelDispatchResult<AppPushDispatchOutcome>> => {
	if (!resolvedDispatch) {
		return { outcomes: [] };
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

	const outcomes = settled.map((result, index): AppPushDispatchOutcome => {
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

	return { outcomes, error: firstSettledError(settled) };
};
