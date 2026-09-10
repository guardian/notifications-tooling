import { randomUUID } from 'node:crypto';
import {
	type AppPushTestTopicTypeId,
	type AppPushTopicTypeId,
	NotificationChannel,
	resolveAppPushTopic,
} from '@config';
import {
	AppNotificationApiError,
	type AppNotificationImportance,
} from '@services';
import { determineArticleId, determineBlockId } from '@utils';
import { z } from 'zod';
import type { NotificationSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import type { AppPushDispatchOutcome } from '../dispatch-outcome';
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

/** One resolved push: a topic type, its importance, and its mobile-n10n topics. */
export type ResolvedAppPush = {
	topicType: string;
	/** The public edition ids grouped into this push. */
	editions: string[];
	importance: AppNotificationImportance;
	titleOverride?: string;
	topics: Array<{ type: string; name: string }>;
};

/**
 * Groups selected topic-type/edition pairs into one push per topic type. Each
 * type carries a single importance, so grouping by type keeps every push's
 * importance unambiguous. Editions carrying a title override cannot share the
 * generic topic-type title, so each is keyed (and sent) separately. Throws if a
 * pair has no configured topic. Shared by the production and internal-test push
 * flows.
 */
export const groupAppPushTopicsByType = (
	items: ReadonlyArray<{
		type: AppPushTopicTypeId | AppPushTestTopicTypeId;
		name: string;
	}>,
): ResolvedAppPush[] => {
	const pushesByKey = new Map<string, ResolvedAppPush>();
	for (const { type, name } of items) {
		const resolved = resolveAppPushTopic(type, name);
		if (!resolved) {
			throw new Error(
				`No push topic is configured for topic type '${type}' edition '${name}'.`,
			);
		}
		const key = resolved.titleOverride
			? `${type}::${resolved.titleOverride}`
			: type;
		const push = pushesByKey.get(key) ?? {
			topicType: type,
			editions: [],
			importance: resolved.importance,
			titleOverride: resolved.titleOverride,
			topics: [],
		};
		push.editions.push(name);
		push.topics.push(resolved.topic);
		pushesByKey.set(key, push);
	}
	return [...pushesByKey.values()];
};

export const resolveAppPushDispatch = (
	request: NotificationSendRequest,
	createdByEmail: string,
) => {
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
		createdByEmail,
		pushes: groupAppPushTopicsByType(plan.audience.items),
	};
};

/** The content, sender and grouped pushes a single app-push dispatch sends. */
export type ResolvedAppPushDispatch = NonNullable<
	ReturnType<typeof resolveAppPushDispatch>
>;

/**
 * Sends one mobile-n10n push per resolved topic-type group and maps each to a
 * dispatch outcome. Shared by the production and internal-test push flows, which
 * differ only in how they resolve the content, sender and pushes.
 */
export const sendResolvedAppPushes = async (
	{ item, sender, createdByEmail, pushes }: ResolvedAppPushDispatch,
	dependencies: DispatchNotificationDependencies,
): Promise<ChannelDispatchResult<AppPushDispatchOutcome>> => {
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
	// A liveblog block link deep-links to that block; absent for plain articles.
	const blockId = determineBlockId(item.link);

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
				// Ophan attributes on this single string, so carry both the
				// originating system and the author it lost otherwise.
				sender: `${sender} <${createdByEmail}>`,
				title: push.titleOverride ?? item.title,
				body: item.body,
				link: item.link,
				contentApiId,
				...(blockId ? { blockId } : {}),
				importance: push.importance,
				topics: push.topics,
				media: item.media,
			}),
		),
	);

	const outcomes = settled.map((result, index): AppPushDispatchOutcome => {
		const { push } = dispatched[index]!;
		const requested = {
			channel: 'app-push' as const,
			topicType: push.topicType,
			editions: push.editions,
		};
		const resolved = {
			channel: 'app-push' as const,
			topics: push.topics,
			importance: push.importance,
			...(blockId ? { blockId } : {}),
		};
		if (result.status === 'fulfilled') {
			return {
				requested,
				resolved,
				status: 'success',
				providerRef: dispatched[index]!.id,
				failureReason: null,
				providerStatusCode: result.value.status,
			};
		}
		return {
			requested,
			resolved,
			status: 'failure',
			providerRef: dispatched[index]!.id,
			failureReason:
				result.reason instanceof AppNotificationApiError
					? result.reason.reason
					: 'unknown',
			providerStatusCode:
				result.reason instanceof AppNotificationApiError
					? (result.reason.status ?? null)
					: null,
		};
	});

	return { outcomes, error: firstSettledError(settled) };
};

export const dispatchAppPush = async (
	resolvedDispatch: ReturnType<typeof resolveAppPushDispatch>,
	_notificationId: string,
	dependencies: DispatchNotificationDependencies,
): Promise<ChannelDispatchResult<AppPushDispatchOutcome>> => {
	if (!resolvedDispatch) {
		return { outcomes: [] };
	}

	return sendResolvedAppPushes(resolvedDispatch, dependencies);
};
