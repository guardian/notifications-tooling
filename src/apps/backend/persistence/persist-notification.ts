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
		providerStatusCode: outcome.providerStatusCode ?? null,
	})),
	...newsletter.map((outcome): NewNotificationDispatch => ({
		notificationId,
		channel: 'newsletter',
		target: outcome.variant,
		providerRef: outcome.dispatchId ?? null,
		status: outcome.status,
		failureReason: outcome.failureReason ?? null,
		providerStatusCode: outcome.providerStatusCode ?? null,
	})),
];

/** The client-facing shape of one persisted dispatch outcome. */
export const toPublicDispatch = (dispatch: NotificationDispatch) => ({
	id: dispatch.id,
	channel: dispatch.channel,
	target: dispatch.target,
	status: dispatch.status,
	providerRef: dispatch.providerRef,
	failureReason: dispatch.failureReason,
	providerStatusCode: dispatch.providerStatusCode,
	detail: dispatch.detail,
	createdAt: dispatch.createdAt.toISOString(),
	updatedAt: dispatch.updatedAt.toISOString(),
});

/**
 * The `2xx` response body for both send and test endpoints: the persisted
 * notification resource with its dispatch outcomes nested underneath. The
 * `status` is rolled up from those outcomes, so a caller sees what actually
 * happened rather than a fixed acknowledgement.
 */
export const toNotificationResponse = ({
	notification,
	dispatches,
}: PersistedNotification) => ({
	id: notification.id,
	idempotencyKey: notification.idempotencyKey,
	kind: notification.kind,
	status: notification.status,
	sender: notification.sender,
	createdByEmail: notification.createdByEmail,
	dryRun: notification.dryRun,
	scheduledFor: notification.scheduledFor?.toISOString() ?? null,
	content: notification.content,
	channels: notification.channels,
	createdAt: notification.createdAt.toISOString(),
	updatedAt: notification.updatedAt.toISOString(),
	dispatches: dispatches.map(toPublicDispatch),
});

/** Maps a notification's rolled-up status to the response's HTTP status code. */
export const httpStatusForNotification = (
	status: NotificationStatus,
): number => {
	switch (status) {
		// Created and every target delivered.
		case 'delivered':
			return 201;
		// Some targets delivered, some failed — the body details each one.
		case 'partially_delivered':
			return 207;
		// Every target failed at the provider.
		case 'failed':
			return 502;
		// Recorded but nothing was delivered yet (e.g. a dry run).
		case 'accepted':
		default:
			return 202;
	}
};

type NotificationEnvelope = {
	kind: 'send' | 'test';
	idempotencyKey: string;
	sender: string;
	createdByEmail: string;
	dryRun: boolean;
	scheduledFor: Date | null;
	content: Record<string, unknown>;
	channels: Record<string, unknown>;
};

/** Inserts the envelope with the default 'accepted' status; the DB mints the id. */
const insertNotification = (
	envelope: NotificationEnvelope,
): Promise<Notification> =>
	getDb().then((db) => createNotificationsRepository(db).create(envelope));

/**
 * Upserts each dispatch outcome and rolls the notification's status up from
 * them, updating the stored row only when the status actually changed.
 */
const recordDispatches = async (
	notification: Notification,
	dispatches: NewNotificationDispatch[],
): Promise<PersistedNotification> => {
	const db = await getDb();
	const notificationsRepository = createNotificationsRepository(db);
	const dispatchesRepository = createNotificationDispatchesRepository(db);

	const persistedDispatches = await Promise.all(
		dispatches.map((dispatch) => dispatchesRepository.upsert(dispatch)),
	);

	const status = rollUpStatus(dispatches);
	const updated =
		status === notification.status
			? notification
			: await notificationsRepository.updateStatus(notification.id, status);

	return { notification: updated, dispatches: persistedDispatches };
};

/** Flags a notification whose dispatch threw before any outcome was recorded. */
const markNotificationFailed = (
	notification: Notification,
): Promise<Notification> =>
	getDb().then((db) =>
		createNotificationsRepository(db).updateStatus(notification.id, 'failed'),
	);

/**
 * A two-phase persistence handle for one endpoint: `create` records the
 * envelope before dispatch (the DB mints the id), `recordOutcomes` persists the
 * dispatch results and the rolled-up status afterwards, and `markFailed` flags
 * a notification whose dispatch threw before any outcome could be recorded.
 */
export type NotificationStore<Request, Outcomes> = {
	create(request: Request, createdByEmail: string): Promise<Notification>;
	recordOutcomes(
		notification: Notification,
		outcomes: Outcomes,
	): Promise<PersistedNotification>;
	markFailed(notification: Notification): Promise<Notification>;
};

export type SendNotificationStore = NotificationStore<
	NotificationSendRequest,
	DispatchOutcomes
>;

export type TestNotificationStore = NotificationStore<
	NotificationTestSendRequest,
	TestDispatchOutcomes
>;

export const sendNotificationStore: SendNotificationStore = {
	create: (request, createdByEmail) =>
		insertNotification({
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
		}),
	recordOutcomes: (notification, outcomes) =>
		recordDispatches(
			notification,
			mapSendOutcomesToDispatches(notification.id, outcomes),
		),
	markFailed: markNotificationFailed,
};

export const testNotificationStore: TestNotificationStore = {
	create: (request, createdByEmail) =>
		insertNotification({
			kind: 'test',
			idempotencyKey: request.idempotencyKey,
			sender: request.sender,
			createdByEmail,
			dryRun: request.options.dryRun,
			scheduledFor: null,
			content: request.content,
			channels: request.channels,
		}),
	recordOutcomes: (notification, outcomes) =>
		recordDispatches(
			notification,
			mapTestOutcomesToDispatches(notification.id, outcomes),
		),
	markFailed: markNotificationFailed,
};
