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
import {
	createNotificationsRepository,
	DuplicateIdempotencyKeyError,
	type NotificationsRepository,
} from './notifications-repository';

let database: Awaited<ReturnType<typeof setupTestDatabase>>;
let notifications: NotificationsRepository;
let dispatches: ReturnType<typeof createNotificationDispatchesRepository>;

beforeAll(async () => {
	database = await setupTestDatabase();
	notifications = createNotificationsRepository(database.db);
	dispatches = createNotificationDispatchesRepository(database.db);
});

afterAll(() => database.close());

beforeEach(() => database.truncate());

describe('notifications repository (real Postgres)', () => {
	it('inserts a notification and reads it back with defaults and JSON intact', async () => {
		const input = buildNotification();

		const created = await notifications.create(input);

		expect(created.status).toBe('accepted');
		expect(created.dryRun).toBe(false);

		const found = await notifications.findById(created.id);

		expect(found?.idempotencyKey).toBe(input.idempotencyKey);
		expect(found?.content).toEqual(input.content);
		expect(found?.channels).toEqual(input.channels);
	});

	it('rolls the status up once the dispatch outcomes settle', async () => {
		const created = await notifications.create(buildNotification());
		expect(created.status).toBe('accepted');

		const updated = await notifications.updateStatus(created.id, 'delivered');

		expect(updated.status).toBe('delivered');
		expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
			created.updatedAt.getTime(),
		);

		const found = await notifications.findById(created.id);
		expect(found?.status).toBe('delivered');
	});

	it('loads a notification together with its dispatches, oldest first', async () => {
		const notification = await notifications.create(buildNotification());

		await dispatches.upsert(
			buildDispatch(notification.id, { target: 'breaking-news' }),
		);
		await dispatches.upsert(
			buildDispatch(notification.id, {
				channel: 'newsletter',
				target: 'morning-briefing-uk',
			}),
		);

		const found = await notifications.findByIdWithDispatches(notification.id);

		expect(found?.dispatches.map((dispatch) => dispatch.target)).toEqual([
			'breaking-news',
			'morning-briefing-uk',
		]);
	});

	it('rejects a second notification reusing an idempotency key', async () => {
		const input = buildNotification();
		await notifications.create(input);

		return expect(
			notifications.create({
				...buildNotification(),
				idempotencyKey: input.idempotencyKey,
			}),
		).rejects.toBeInstanceOf(DuplicateIdempotencyKeyError);
	});
});
