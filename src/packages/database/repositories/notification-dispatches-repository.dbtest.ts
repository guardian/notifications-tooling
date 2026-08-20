import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from 'bun:test';
import {
	buildDispatch,
	buildNotification,
	setupTestDatabase,
} from '../test-helpers';
import { createNotificationDispatchesRepository } from './notification-dispatches-repository';
import { createNotificationsRepository } from './notifications-repository';

let database: Awaited<ReturnType<typeof setupTestDatabase>>;
let dispatches: ReturnType<typeof createNotificationDispatchesRepository>;
let notifications: ReturnType<typeof createNotificationsRepository>;

beforeAll(async () => {
	database = await setupTestDatabase();
	dispatches = createNotificationDispatchesRepository(database.db);
	notifications = createNotificationsRepository(database.db);
});

afterAll(() => database.close());

beforeEach(() => database.truncate());

describe('notification dispatches repository (real Postgres)', () => {
	it('upserts on retry rather than duplicating a (notification, channel, target)', async () => {
		const notification = await notifications.create(buildNotification());

		const first = await dispatches.upsert(
			buildDispatch(notification.id, {
				status: 'failure',
				failureReason: 'unknown',
			}),
		);

		const retried = await dispatches.upsert(
			buildDispatch(notification.id, {
				status: 'success',
				providerRef: 'mobile-n10n-2',
			}),
		);

		expect(retried.id).toBe(first.id);
		expect(retried.status).toBe('success');
		expect(retried.failureReason).toBeNull();

		expect(await dispatches.findByNotificationId(notification.id)).toHaveLength(
			1,
		);
	});
});
