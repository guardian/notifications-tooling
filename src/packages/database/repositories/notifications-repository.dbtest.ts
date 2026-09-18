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

	it('filters newsletter audiences and app-push editions by audience', async () => {
		const appPush = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'europe' }],
					},
					compose: { use: 'lead-story' },
				},
			},
		});
		const newsletter = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(2),
			channels: {
				newsletter: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['lead-story'], subject: 'Daily briefing' },
				},
			},
		});
		await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(3),
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'au' }],
					},
					compose: { use: 'lead-story' },
				},
			},
		});

		const newsletterPage = await notifications.listRecent({
			since: daysAgo(14),
			audiences: ['uk'],
		});

		expect(newsletterPage.total).toBe(1);
		expect(newsletterPage.notifications.map(({ id }) => id)).toEqual([
			newsletter.id,
		]);

		const appPushPage = await notifications.listRecent({
			since: daysAgo(14),
			audiences: ['europe'],
		});

		expect(appPushPage.total).toBe(1);
		expect(appPushPage.notifications.map(({ id }) => id)).toEqual([appPush.id]);

		const combinedPage = await notifications.listRecent({
			since: daysAgo(14),
			audiences: ['uk', 'europe'],
		});

		expect(combinedPage.total).toBe(2);
		expect(combinedPage.notifications.map(({ id }) => id)).toEqual([
			appPush.id,
			newsletter.id,
		]);
	});

	it('filters rolled-up statuses while reporting the filtered total', async () => {
		const accepted = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
		});
		const delivered = await notifications.create({
			...buildNotification(),
			status: 'delivered',
			createdAt: daysAgo(2),
		});
		const partial = await notifications.create({
			...buildNotification(),
			status: 'partially_delivered',
			createdAt: daysAgo(3),
		});
		const failed = await notifications.create({
			...buildNotification(),
			status: 'failed',
			createdAt: daysAgo(4),
		});

		const sentPage = await notifications.listRecent({
			since: daysAgo(14),
			statuses: ['accepted', 'delivered'],
		});

		expect(sentPage.total).toBe(2);
		expect(sentPage.notifications.map(({ id }) => id)).toEqual([
			accepted.id,
			delivered.id,
		]);

		const errorPage = await notifications.listRecent({
			since: daysAgo(14),
			statuses: ['partially_delivered', 'failed'],
		});

		expect(errorPage.total).toBe(2);
		expect(errorPage.notifications.map(({ id }) => id)).toEqual([
			partial.id,
			failed.id,
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
});
