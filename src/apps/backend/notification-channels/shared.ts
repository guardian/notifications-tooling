import type { NotificationChannel } from '@config';
import { getSSMParameter } from '@config/ssm';
import { renderEmail, sendAppNotification } from '@services';
import { loadBrazeClient } from '../braze-client';
import type {
	NotificationSendRequest,
	NotificationTestSendRequest,
} from '../routers/notifications/schemas/notification-send-request';

// Each provider request shares a fixed timeout; it is not configurable per
// environment.
export const PROVIDER_REQUEST_TIMEOUT_MS = 10_000;

export type DispatchNotificationDependencies = {
	getSSMParameter: typeof getSSMParameter;
	loadBrazeClient: typeof loadBrazeClient;
	renderEmail: typeof renderEmail;
	sendAppNotification: typeof sendAppNotification;
};

export const defaultDependencies: DispatchNotificationDependencies = {
	getSSMParameter,
	loadBrazeClient,
	renderEmail,
	sendAppNotification,
};

/**
 * A channel's per-target outcomes plus the first provider rejection, if any.
 * Every target is still attempted (see the `allSettled` in each dispatcher); the
 * `error` lets the orchestrator surface that failure as the documented 502/504
 * instead of a false 202.
 */
export type ChannelDispatchResult<TOutcome> = {
	outcomes: TOutcome[];
	error?: unknown;
};

/** The first rejection among settled results, or `undefined` if all fulfilled. */
export const firstSettledError = (
	settled: ReadonlyArray<PromiseSettledResult<unknown>>,
): unknown => {
	for (const result of settled) {
		if (result.status === 'rejected') {
			return result.reason;
		}
	}
	return undefined;
};

export const requireContentItem = (
	request: NotificationSendRequest | NotificationTestSendRequest,
	itemId: string,
	channel: NotificationChannel,
) => {
	const item = request.content.items[itemId];

	if (item?.type !== channel) {
		throw new Error(
			`Content item '${itemId}' is not valid for the '${channel}' channel.`,
		);
	}

	return item;
};
