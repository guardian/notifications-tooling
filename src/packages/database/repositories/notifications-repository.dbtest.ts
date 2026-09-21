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

	it('defaults failedTargets to empty arrays and records them with the status', async () => {
		const created = await notifications.create(buildNotification());
		expect(created.failedTargets).toEqual({ topics: [], segments: [] });

		const updated = await notifications.updateDeliveryOutcome(created.id, {
			status: 'partially_delivered',
			failedTargets: {
				topics: [{ topicType: 'sport', edition: 'uk' }],
				segments: [{ segmentId: 'UK' }],
			},
		});

		expect(updated.status).toBe('partially_delivered');
		expect(updated.failedTargets).toEqual({
			topics: [{ topicType: 'sport', edition: 'uk' }],
			segments: [{ segmentId: 'UK' }],
		});

		const found = await notifications.findById(created.id);
		expect(found?.failedTargets).toEqual({
			topics: [{ topicType: 'sport', edition: 'uk' }],
			segments: [{ segmentId: 'UK' }],
		});
	});

	it('loads a notification together with its dispatches, oldest first', async () => {
		const notification = await notifications.create(buildNotification());

		await dispatches.upsert(buildDispatch(notification.id));
		await dispatches.upsert(
			buildDispatch(notification.id, {
				channel: 'newsletter',
				requested: { channel: 'newsletter', segment: 'morning-briefing-uk' },
				resolved: {
					channel: 'newsletter',
					emailRenderingId: 'morning-briefing-uk',
				},
			}),
		);

		const found = await notifications.findByIdWithDispatches(notification.id);

		expect(found?.dispatches.map((dispatch) => dispatch.requested)).toEqual([
			{ channel: 'app-push', topicType: 'breaking-news', editions: ['uk'] },
			{ channel: 'newsletter', segment: 'morning-briefing-uk' },
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
	it('returns only notifications created at or after the cut-off, newest first', async () => {
		const recent = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
		});
		const alsoRecent = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(13),
		});
		// Created before the cut-off: must be excluded.
		await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(20),
		});

		const page = await notifications.listRecent({ since: daysAgo(14) });

		expect(page.total).toBe(2);
		expect(page.notifications.map((row) => row.id)).toEqual([
			recent.id,
			alsoRecent.id,
		]);
	});

	it('applies limit and offset while reporting the full cut-off total', async () => {
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

		const firstPage = await notifications.listRecent({
			since: daysAgo(14),
			limit: 2,
		});
		expect(firstPage.total).toBe(3);
		expect(firstPage.notifications.map((row) => row.id)).toEqual([
			first.id,
			second.id,
		]);

		const secondPage = await notifications.listRecent({
			since: daysAgo(14),
			limit: 2,
			offset: 2,
		});
		expect(secondPage.total).toBe(3);
		expect(secondPage.notifications.map((row) => row.id)).toEqual([third.id]);
	});

	it('searches body and title fields while reporting the filtered total', async () => {
		const bodyMatch = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
			content: {
				items: {
					'lead-story': {
						type: 'app-push',
						title: 'Breaking news',
						body: 'Northern lights visible tonight',
						link: 'https://www.theguardian.com/science',
					},
				},
			},
		});
		const titleMatch = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(2),
			content: {
				items: {
					briefing: {
						type: 'newsletter',
						title: 'The Northern briefing',
						body: 'The stories shaping the day',
						link: 'https://www.theguardian.com/newsletters',
					},
				},
			},
		});
		await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(3),
			createdByEmail: 'northern.editor@guardian.co.uk',
		});
		await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(4),
			content: {
				items: {
					'lead-story': {
						type: 'app-push',
						title: 'Breaking news',
						body: 'Read our latest report',
						link: 'https://www.theguardian.com/northern-lights',
					},
				},
			},
		});

		const page = await notifications.listRecent({
			since: daysAgo(14),
			search: 'NORTHERN',
			limit: 1,
		});

		expect(page.total).toBe(2);
		expect(page.notifications.map(({ id }) => id)).toEqual([bodyMatch.id]);

		const secondPage = await notifications.listRecent({
			since: daysAgo(14),
			search: 'northern',
			limit: 1,
			offset: 1,
		});
		expect(secondPage.notifications.map(({ id }) => id)).toEqual([
			titleMatch.id,
		]);
	});

	it('excludes test notifications from the page and the total', async () => {
		const send = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
		});
		await notifications.create({
			...buildNotification(),
			kind: 'test',
			createdAt: daysAgo(1),
		});

		const page = await notifications.listRecent({ since: daysAgo(14) });

		expect(page.total).toBe(1);
		expect(page.notifications.map((row) => row.id)).toEqual([send.id]);
	});

	it('filters the page and the total to a single sender', async () => {
		const mine = await notifications.create({
			...buildNotification(),
			createdByEmail: 'ada.lovelace@guardian.co.uk',
			createdAt: daysAgo(1),
		});
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'grace.hopper@guardian.co.uk',
			createdAt: daysAgo(2),
		});

		const page = await notifications.listRecent({
			since: daysAgo(14),
			createdByEmail: 'ada.lovelace@guardian.co.uk',
		});

		expect(page.total).toBe(1);
		expect(page.notifications.map((row) => row.id)).toEqual([mine.id]);
	});

	it('matches the createdByEmail filter case-insensitively', async () => {
		const mine = await notifications.create({
			...buildNotification(),
			createdByEmail: 'Ada.Lovelace@Guardian.co.uk',
			createdAt: daysAgo(1),
		});
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'grace.hopper@guardian.co.uk',
			createdAt: daysAgo(2),
		});

		const page = await notifications.listRecent({
			since: daysAgo(14),
			createdByEmail: 'ada.lovelace@GUARDIAN.co.uk',
		});

		expect(page.total).toBe(1);
		expect(page.notifications.map((row) => row.id)).toEqual([mine.id]);
	});
});

describe('notifications repository listDistinctSenders (real Postgres)', () => {
	it('returns the distinct senders within the cut-off, alphabetically', async () => {
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'grace.hopper@guardian.co.uk',
			createdAt: daysAgo(1),
		});
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'ada.lovelace@guardian.co.uk',
			createdAt: daysAgo(2),
		});
		// A duplicate sender collapses to one entry.
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'ada.lovelace@guardian.co.uk',
			createdAt: daysAgo(3),
		});
		// A test notification is excluded.
		await notifications.create({
			...buildNotification(),
			kind: 'test',
			createdByEmail: 'test.only@guardian.co.uk',
			createdAt: daysAgo(1),
		});
		// Outside the cut-off, so excluded.
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'old.sender@guardian.co.uk',
			createdAt: daysAgo(20),
		});

		const senders = await notifications.listDistinctSenders({
			since: daysAgo(14),
		});

		expect(senders).toEqual([
			'ada.lovelace@guardian.co.uk',
			'grace.hopper@guardian.co.uk',
		]);
	});

	it('normalises senders to lowercase so case variants collapse', async () => {
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'Ada.Lovelace@Guardian.co.uk',
			createdAt: daysAgo(1),
		});
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'ada.lovelace@guardian.co.uk',
			createdAt: daysAgo(2),
		});

		const senders = await notifications.listDistinctSenders({
			since: daysAgo(14),
		});

		expect(senders).toEqual(['ada.lovelace@guardian.co.uk']);
	});
});
