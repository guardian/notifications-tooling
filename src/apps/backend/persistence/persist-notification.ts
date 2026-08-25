import {
	createNotificationDispatchesRepository,
	createNotificationsRepository,
	getDb,
	type NewNotificationDispatch,
	type Notification,
	type NotificationDispatch,
} from '@database';
import type { DispatchOutcomes } from '../notification-channels/dispatch-notification';
import type { TestDispatchOutcomes } from '../notification-channels/dispatch-notification-test';
import type {
	NotificationSendRequest,
	NotificationTestSendRequest,
} from '../routers/notifications/schemas/notification-send-request';

type NotificationStatus = Notification['status'];

/** The persisted notification envelope plus every dispatch outcome recorded for it. */
export type PersistedNotification = {
	notification: Notification;
	dispatches: NotificationDispatch[];
};

/** Rolls the per-target dispatch outcomes up into the notification's status. */
export const rollUpStatus = (
	dispatches: readonly NewNotificationDispatch[],
): NotificationStatus => {
	if (dispatches.length === 0) {
		return 'accepted';
	}

	const anySuccess = dispatches.some((d) => d.status === 'success');
	const anyFailure = dispatches.some((d) => d.status === 'failure');

	if (anySuccess && anyFailure) {
		return 'partially_delivered';
	}
	return anyFailure ? 'failed' : 'delivered';
};

/** Maps a production dispatch's per-channel outcomes to dispatch rows. */
export const mapSendOutcomesToDispatches = (
	notificationId: string,
	{ appPush, newsletter }: DispatchOutcomes,
): NewNotificationDispatch[] => [
	...appPush.map((outcome): NewNotificationDispatch => ({
		notificationId,
		channel: 'app-push',
		target: outcome.topicType,
		providerRef: outcome.id,
		status: outcome.status,
		failureReason: outcome.failureReason ?? null,
		providerStatusCode: outcome.providerStatusCode ?? null,
	})),
	...newsletter.map((outcome): NewNotificationDispatch => ({
		notificationId,
		channel: 'newsletter',
		target: outcome.segmentId,
		providerRef: outcome.dispatchId ?? null,
		status: outcome.status,
		failureReason: outcome.failureReason ?? null,
		providerStatusCode: outcome.providerStatusCode ?? null,
		detail: { campaignId: outcome.campaignId },
	})),
];

/** Maps a test dispatch's per-channel outcomes to dispatch rows. */
export const mapTestOutcomesToDispatches = (
	notificationId: string,
	{ appPush, newsletter }: TestDispatchOutcomes,
): NewNotificationDispatch[] => [
	...appPush.map((outcome): NewNotificationDispatch => ({
		notificationId,
		channel: 'app-push',
		target: outcome.topicType,
		providerRef: outcome.id,
		status: outcome.status,
		failureReason: outcome.failureReason ?? null,
	})),
	...newsletter.map((outcome): NewNotificationDispatch => ({
		notificationId,
		channel: 'newsletter',
		target: outcome.variant,
		providerRef: outcome.dispatchId ?? null,
		status: outcome.status,
		failureReason: outcome.failureReason ?? null,
	})),
];

/** The client-facing shape of one persisted dispatch outcome. */
export const toPublicDispatch = (dispatch: NotificationDispatch) => ({
	channel: dispatch.channel,
	target: dispatch.target,
	status: dispatch.status,
	providerRef: dispatch.providerRef,
	failureReason: dispatch.failureReason,
	providerStatusCode: dispatch.providerStatusCode,
});

type NotificationEnvelope = {
	notificationId: string;
	kind: 'send' | 'test';
	idempotencyKey: string;
	sender: string;
	createdByEmail: string;
	dryRun: boolean;
	scheduledFor: Date | null;
	content: Record<string, unknown>;
	channels: Record<string, unknown>;
};

/**
 * Inserts the notification envelope and upserts each dispatch outcome, deriving
 * the notification status from those outcomes. The id is minted before dispatch
 * so the persisted rows match the ids the channel adapters tagged downstream.
 */
const writeNotification = async (
	envelope: NotificationEnvelope,
	dispatches: NewNotificationDispatch[],
): Promise<PersistedNotification> => {
	const db = await getDb();
	const notificationsRepository = createNotificationsRepository(db);
	const dispatchesRepository = createNotificationDispatchesRepository(db);

	const notification = await notificationsRepository.create({
		id: envelope.notificationId,
		idempotencyKey: envelope.idempotencyKey,
		kind: envelope.kind,
		status: rollUpStatus(dispatches),
		sender: envelope.sender,
		createdByEmail: envelope.createdByEmail,
		dryRun: envelope.dryRun,
		scheduledFor: envelope.scheduledFor,
		content: envelope.content,
		channels: envelope.channels,
	});

	const persistedDispatches = await Promise.all(
		dispatches.map((dispatch) => dispatchesRepository.upsert(dispatch)),
	);

	return { notification, dispatches: persistedDispatches };
};

export type PersistSendNotification = (input: {
	notificationId: string;
	request: NotificationSendRequest;
	createdByEmail: string;
	outcomes: DispatchOutcomes;
}) => Promise<PersistedNotification>;

/** Persists a production `POST /v1/notifications` send and its outcomes. */
export const persistSendNotification: PersistSendNotification = ({
	notificationId,
	request,
	createdByEmail,
	outcomes,
}) =>
	writeNotification(
		{
			notificationId,
			kind: 'send',
			idempotencyKey: request.idempotencyKey,
			sender: request.sender,
			createdByEmail,
			dryRun: request.options.dryRun,
			scheduledFor: request.options.scheduledFor
				? new Date(request.options.scheduledFor)
				: null,
			content: request.content,
			channels: request.channels,
		},
		mapSendOutcomesToDispatches(notificationId, outcomes),
	);

export type PersistTestNotification = (input: {
	testId: string;
	request: NotificationTestSendRequest;
	createdByEmail: string;
	outcomes: TestDispatchOutcomes;
}) => Promise<PersistedNotification>;

/** Persists a `POST /v1/notification-tests` send and its outcomes. */
export const persistTestNotification: PersistTestNotification = ({
	testId,
	request,
	createdByEmail,
	outcomes,
}) =>
	writeNotification(
		{
			notificationId: testId,
			kind: 'test',
			idempotencyKey: request.idempotencyKey,
			sender: request.sender,
			createdByEmail,
			dryRun: request.options.dryRun,
			scheduledFor: null,
			content: request.content,
			channels: request.channels,
		},
		mapTestOutcomesToDispatches(testId, outcomes),
	);
