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

const daysAgo = (days: number): Date =>
	new Date(Date.now() - days * 24 * 60 * 60 * 1000);

describe('notifications repository listRecent (real Postgres)', () => {
	it('returns only notifications from the last 14 days, newest first', async () => {
		const recent = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
		});
		const alsoRecent = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(13),
		});
		// Older than the 14-day window: must be excluded.
		await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(20),
		});

		const page = await notifications.listRecent();

		expect(page.total).toBe(2);
		expect(page.notifications.map((row) => row.id)).toEqual([
			recent.id,
			alsoRecent.id,
		]);
	});

	it('applies limit and offset while reporting the full window total', async () => {
		const first = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
		});
		const second = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(2),
		});
		const third = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(3),
		});

		const firstPage = await notifications.listRecent({ limit: 2 });
		expect(firstPage.total).toBe(3);
		expect(firstPage.notifications.map((row) => row.id)).toEqual([
			first.id,
			second.id,
		]);

		const secondPage = await notifications.listRecent({ limit: 2, offset: 2 });
		expect(secondPage.total).toBe(3);
		expect(secondPage.notifications.map((row) => row.id)).toEqual([third.id]);
	});
});
