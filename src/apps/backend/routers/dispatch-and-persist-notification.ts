import type { Notification } from '@database';
import type { DispatchOutcome } from '../notification-channels/dispatch-outcome';
import type {
	NotificationStore,
	PersistedNotification,
} from '../persistence/persist-notification';

type NotificationDispatchOutcomes = {
	appPush: DispatchOutcome[];
	newsletter: DispatchOutcome[];
};

type DispatchResult = NotificationDispatchOutcomes & { error?: unknown };

type DispatchAndPersistOptions<Request> = {
	request: Request;
	createdByEmail: string;
	dispatchRequest: (
		request: Request,
		notificationId: string,
		createdByEmail: string,
	) => Promise<DispatchResult>;
	store: NotificationStore<Request, NotificationDispatchOutcomes>;
};

type RecordedDispatch = {
	type: 'recorded';
	notification: Notification;
	persisted: PersistedNotification;
	outcomes: NotificationDispatchOutcomes;
	providerError: unknown;
};

type FailedDispatch = {
	type: 'failed';
	notification: Notification;
	failedNotification: Notification;
	dispatchError: unknown;
	markFailedError?: unknown;
};

export const dispatchAndPersistNotification = async <Request>({
	request,
	createdByEmail,
	dispatchRequest,
	store,
}: DispatchAndPersistOptions<Request>): Promise<
	RecordedDispatch | FailedDispatch
> => {
	const notification = await store.create(request, createdByEmail);

	try {
		const { error: providerError, ...outcomes } = await dispatchRequest(
			request,
			notification.id,
			notification.createdByEmail,
		);
		const persisted = await store.recordOutcomes(notification, outcomes);

		return {
			type: 'recorded',
			notification,
			persisted,
			outcomes,
			providerError,
		};
	} catch (dispatchError) {
		try {
			const failedNotification = await store.markFailed(notification);
			return {
				type: 'failed',
				notification,
				failedNotification,
				dispatchError,
			};
		} catch (markFailedError) {
			return {
				type: 'failed',
				notification,
				failedNotification: notification,
				dispatchError,
				markFailedError,
			};
		}
	}
};
