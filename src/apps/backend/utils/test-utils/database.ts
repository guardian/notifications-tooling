import { mock } from 'bun:test';
import type { PersistedNotification } from '../../persistence/persist-notification';

class DuplicateIdempotencyKeyError extends Error {
	constructor(public readonly idempotencyKey: string) {
		super(
			`A notification with idempotencyKey '${idempotencyKey}' already exists.`,
		);
		this.name = 'DuplicateIdempotencyKeyError';
	}
}

export const dbExecuteMock = mock<(query: string) => Promise<void>>(() =>
	Promise.resolve(),
);

const mockedDb = {
	execute: dbExecuteMock,
};

const createNotificationsRepository = () => ({
	create: mock(() =>
		Promise.resolve(buildPersistedNotification().notification),
	),
	updateStatus: mock((id: string, status: string) =>
		Promise.resolve({
			...buildPersistedNotification().notification,
			id,
			status,
		} as PersistedNotification['notification']),
	),
	findById: mock(() => Promise.resolve(null)),
	findByIdWithDispatches: mock(() => Promise.resolve(null)),
});

const createNotificationDispatchesRepository = () => ({
	upsert: mock((dispatch: unknown) => Promise.resolve(dispatch)),
});

export const installDatabaseMock = (): void => {
	void mock.module('@database', () => ({
		createNotificationDispatchesRepository,
		createNotificationsRepository,
		DuplicateIdempotencyKeyError,
		getDb: () => Promise.resolve(mockedDb),
	}));
};

/** Partial overrides for the canned persisted notification used in tests. */
type PersistedNotificationOverrides = {
	notification?: Partial<PersistedNotification['notification']>;
	dispatches?: PersistedNotification['dispatches'];
};

/** A canned persisted notification for router tests that inject persistence. */
export const buildPersistedNotification = (
	overrides: PersistedNotificationOverrides = {},
): PersistedNotification => ({
	notification: {
		id: '00000000-0000-0000-0000-000000000000',
		idempotencyKey: 'test-idempotency-key',
		kind: 'send',
		status: 'accepted',
		sender: 'notifications-tooling-spa/v1',
		createdByEmail: 'ada.lovelace@guardian.co.uk',
		dryRun: false,
		scheduledFor: null,
		content: {},
		channels: {},
		createdAt: new Date(0),
		updatedAt: new Date(0),
		...overrides.notification,
	},
	dispatches: overrides.dispatches ?? [],
});

/** A persistence stub for router tests: records nothing, echoes canned rows. */
export const mockNotificationStore = (
	overrides: PersistedNotificationOverrides = {},
) => {
	const base = buildPersistedNotification(overrides).notification;
	const settledStatus =
		overrides.notification?.status ??
		((overrides.dispatches?.length ?? 0) > 0 ? 'delivered' : 'accepted');

	return {
		// Mirrors the DB minting the id and defaulting the status to 'accepted',
		// echoing the request's dry-run flag onto the stored row.
		create: mock((request: { options?: { dryRun?: boolean } }) =>
			Promise.resolve({
				...base,
				status: 'accepted' as const,
				dryRun: request.options?.dryRun ?? base.dryRun,
			}),
		),
		// Preserves the created row's identity, applying the settled status and
		// the canned dispatch rows.
		recordOutcomes: mock(
			(notification: PersistedNotification['notification']) =>
				Promise.resolve({
					notification: { ...notification, status: settledStatus },
					dispatches: overrides.dispatches ?? [],
				}),
		),
		markFailed: mock((notification: PersistedNotification['notification']) =>
			Promise.resolve({ ...notification, status: 'failed' as const }),
		),
	};
};
