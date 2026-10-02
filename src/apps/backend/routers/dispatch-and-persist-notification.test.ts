import { describe, expect, it, mock } from 'bun:test';
import { buildPersistedNotification } from '../utils/test-utils/database';
import { dispatchAndPersistNotification } from './dispatch-and-persist-notification';

const request = { id: 'request-id' };
const outcomes = { appPush: [], newsletter: [] };

describe('dispatchAndPersistNotification', () => {
	it('creates, dispatches, and records outcomes', async () => {
		const notification = buildPersistedNotification().notification;
		const persisted = buildPersistedNotification({
			notification: { status: 'delivered' },
		});
		const providerError = new Error('provider rejected one target');
		const dispatchRequest = mock(() =>
			Promise.resolve({ ...outcomes, error: providerError }),
		);
		const store = {
			create: mock(() => Promise.resolve(notification)),
			recordOutcomes: mock(() => Promise.resolve(persisted)),
			markFailed: mock(() => Promise.resolve(notification)),
		};

		const result = await dispatchAndPersistNotification({
			request,
			createdByEmail: 'editor@guardian.co.uk',
			dispatchRequest,
			store,
		});

		expect(store.create).toHaveBeenCalledWith(request, 'editor@guardian.co.uk');
		expect(dispatchRequest).toHaveBeenCalledWith(
			request,
			notification.id,
			notification.createdByEmail,
		);
		expect(store.recordOutcomes).toHaveBeenCalledWith(notification, outcomes);
		expect(store.markFailed).not.toHaveBeenCalled();
		expect(result).toEqual({
			type: 'recorded',
			notification,
			persisted,
			outcomes,
			providerError,
		});
	});

	it('marks the notification failed when dispatch throws', async () => {
		const notification = buildPersistedNotification().notification;
		const failedNotification = {
			...notification,
			status: 'failed' as const,
		};
		const dispatchError = new Error('dispatch failed');
		const store = {
			create: mock(() => Promise.resolve(notification)),
			recordOutcomes: mock(() => Promise.resolve(buildPersistedNotification())),
			markFailed: mock(() => Promise.resolve(failedNotification)),
		};

		const result = await dispatchAndPersistNotification({
			request,
			createdByEmail: 'editor@guardian.co.uk',
			dispatchRequest: mock(() => Promise.reject(dispatchError)),
			store,
		});

		expect(store.recordOutcomes).not.toHaveBeenCalled();
		expect(store.markFailed).toHaveBeenCalledWith(notification);
		expect(result).toEqual({
			type: 'failed',
			notification,
			failedNotification,
			dispatchError,
		});
	});

	it('returns both errors when recording outcomes and marking failed throw', async () => {
		const notification = buildPersistedNotification().notification;
		const dispatchError = new Error('could not record outcomes');
		const markFailedError = new Error('could not mark failed');
		const store = {
			create: mock(() => Promise.resolve(notification)),
			recordOutcomes: mock(() => Promise.reject(dispatchError)),
			markFailed: mock(() => Promise.reject(markFailedError)),
		};

		const result = await dispatchAndPersistNotification({
			request,
			createdByEmail: 'editor@guardian.co.uk',
			dispatchRequest: mock(() => Promise.resolve(outcomes)),
			store,
		});

		expect(store.markFailed).toHaveBeenCalledWith(notification);
		expect(result).toEqual({
			type: 'failed',
			notification,
			failedNotification: notification,
			dispatchError,
			markFailedError,
		});
	});
});
