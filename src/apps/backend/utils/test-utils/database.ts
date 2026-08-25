import { mock } from 'bun:test';
import type { PersistedNotification } from '../../persistence/persist-notification';

export const dbExecuteMock = mock<(query: string) => Promise<void>>(() =>
	Promise.resolve(),
);

const mockedDb = {
	execute: dbExecuteMock,
};

export const installDatabaseMock = (): void => {
	void mock.module('@database', () => ({
		getDb: () => Promise.resolve(mockedDb),
	}));
};

/** A canned persisted notification for router tests that inject persistence. */
export const buildPersistedNotification = (
	overrides: Partial<PersistedNotification> = {},
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

/** A persistence stub that records nothing and echoes back a canned envelope. */
export const mockPersistNotification = (
	overrides: Partial<PersistedNotification> = {},
) =>
	mock(
		(input: {
			notificationId?: string;
			testId?: string;
			request?: { options?: { dryRun?: boolean } };
		}) =>
			Promise.resolve(
				buildPersistedNotification({
					...overrides,
					notification: {
						id: input.notificationId ?? input.testId,
						kind: input.testId ? 'test' : 'send',
						dryRun: input.request?.options?.dryRun ?? false,
						...overrides.notification,
					} as PersistedNotification['notification'],
				}),
			),
	);
