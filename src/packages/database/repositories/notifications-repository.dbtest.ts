import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from 'bun:test';
import { historyAlertTypeSchema } from '@models';
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
	const createHistoryNotification = ({
		appAlertType,
		subject,
		title = 'An election update',
		createdAt = daysAgo(1),
		kind = 'send',
	}: {
		appAlertType?: string;
		subject?: string;
		title?: string;
		createdAt?: Date;
		kind?: 'send' | 'test';
	}) =>
		notifications.create({
			...buildNotification(),
			createdAt,
			kind,
			content: {
				items: {
					lead: {
						type: appAlertType ? 'app-push' : 'newsletter',
						title,
						body: 'Latest reporting',
						link: 'https://www.theguardian.com/politics',
					},
				},
			},
			channels: {
				...(appAlertType
					? {
							'app-push': {
								audience: {
									type: 'topic',
									items: [
										{ type: appAlertType, name: 'uk' },
										{ type: appAlertType, name: 'us' },
									],
								},
								compose: { use: 'lead' },
							},
						}
					: {}),
				...(subject !== undefined
					? {
							newsletter: {
								audience: { type: 'segment', items: ['UK'] },
								compose: { items: ['lead'], subject },
							},
						}
					: {}),
			},
		});

	it('matches all five kicker categories, the no-kicker option, case-insensitive prefixes, and only start-of-subject kickers', async () => {
		const appBreaking = await createHistoryNotification({
			appAlertType: 'breaking-news',
		});
		const emailBreaking = await createHistoryNotification({
			subject: 'bReAkInG NeWs: Update',
		});
		const exclusive = await createHistoryNotification({
			subject: 'EXCLUSIVE: Update',
		});
		const editorsPicks = await createHistoryNotification({
			appAlertType: 'editors-picks',
		});
		const oneNotToMiss = await createHistoryNotification({
			appAlertType: 'one-not-to-miss',
		});
		const sport = await createHistoryNotification({ appAlertType: 'sport' });
		const unprefixed = await createHistoryNotification({ subject: 'Update' });
		const embedded = await createHistoryNotification({
			subject: 'Today: Exclusive: Breaking news: Update',
		});
		const leadingSpace = await createHistoryNotification({
			subject: ' Breaking news: Update',
		});
		const expected = {
			'breaking-news': [appBreaking.id, emailBreaking.id],
			exclusive: [exclusive.id],
			'editors-picks': [editorsPicks.id],
			'one-not-to-miss': [oneNotToMiss.id],
			sport: [sport.id],
			none: [unprefixed.id, embedded.id, leadingSpace.id],
		};
		for (const alertType of historyAlertTypeSchema.options) {
			const page = await notifications.listRecent({
				since: daysAgo(14),
				alertTypes: [alertType],
			});
			expect(page.total).toBe(expected[alertType].length);
			expect(page.notifications.map(({ id }) => id).sort()).toEqual(
				expected[alertType].sort(),
			);
		}
		const unfiltered = await notifications.listRecent({
			since: daysAgo(14),
			alertTypes: [],
		});
		expect(unfiltered.total).toBe(9);
		for (const notification of [unprefixed, embedded, leadingSpace]) {
			expect(unfiltered.notifications.map(({ id }) => id)).toContain(
				notification.id,
			);
		}
	});

	it('matches notifications with no recognised kicker, and ORs none with other categories', async () => {
		const unprefixed = await createHistoryNotification({ subject: 'Update' });
		const unknownAppType = await createHistoryNotification({
			appAlertType: 'not-a-kicker',
		});
		const sport = await createHistoryNotification({ appAlertType: 'sport' });
		const breaking = await createHistoryNotification({
			subject: 'Breaking news: Update',
		});

		const none = await notifications.listRecent({
			since: daysAgo(14),
			alertTypes: ['none'],
		});
		expect(none.total).toBe(2);
		expect(none.notifications.map(({ id }) => id).sort()).toEqual(
			[unprefixed.id, unknownAppType.id].sort(),
		);

		const noneOrSport = await notifications.listRecent({
			since: daysAgo(14),
			alertTypes: ['none', 'sport'],
		});
		expect(noneOrSport.total).toBe(3);
		expect(noneOrSport.notifications.map(({ id }) => id).sort()).toEqual(
			[unprefixed.id, unknownAppType.id, sport.id].sort(),
		);
		expect(noneOrSport.notifications.map(({ id }) => id)).not.toContain(
			breaking.id,
		);
	});

	it('combines category OR with search AND before pagination, counting combined plans once', async () => {
		await createHistoryNotification({
			appAlertType: 'sport',
			createdAt: daysAgo(0),
		});
		await createHistoryNotification({
			appAlertType: 'breaking-news',
			title: 'Unrelated wording',
			createdAt: daysAgo(0),
		});
		const first = await createHistoryNotification({
			appAlertType: 'breaking-news',
			subject: 'Exclusive: Update',
			createdAt: daysAgo(1),
		});
		const second = await createHistoryNotification({
			subject: 'Breaking news: Update',
			createdAt: daysAgo(2),
		});
		const third = await createHistoryNotification({
			subject: 'Exclusive: Update',
			createdAt: daysAgo(3),
		});
		await createHistoryNotification({
			subject: 'Exclusive: election',
			title: 'Subject-only match',
		});
		await createHistoryNotification({
			appAlertType: 'breaking-news',
			createdAt: daysAgo(20),
		});
		await createHistoryNotification({
			appAlertType: 'breaking-news',
			kind: 'test',
		});
		const criteria = {
			since: daysAgo(14),
			search: 'ELECTION',
			alertTypes: historyAlertTypeSchema
				.array()
				.parse(['exclusive', 'breaking-news', 'exclusive']),
			limit: 1,
		};
		for (const [offset, id] of [first.id, second.id, third.id].entries()) {
			const page = await notifications.listRecent({ ...criteria, offset });
			expect(page.total).toBe(3);
			expect(page.notifications.map((row) => row.id)).toEqual([id]);
		}
		const emptyPage = await notifications.listRecent({
			...criteria,
			offset: 3,
		});
		expect(emptyPage).toEqual({ total: 3, notifications: [] });
	});

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

	it('lists production sends for an exact article id newest first', async () => {
		const articleId = 'science/2026/sep/23/northern-lights';
		const olderSend = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(10),
			createdByEmail: 'older.sender@guardian.co.uk',
			content: {
				items: {
					lead: {
						type: 'newsletter',
						title: 'Northern lights',
						body: 'Earlier coverage',
						link: `https://www.theguardian.com/${articleId}?CMP=share_btn_url#comments`,
					},
				},
			},
			channels: {
				newsletter: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['lead'], subject: 'Northern lights' },
				},
			},
		});
		const newerSend = await notifications.create({
			...buildNotification(),
			createdAt: daysAgo(1),
			createdByEmail: 'newer.sender@guardian.co.uk',
			content: {
				items: {
					lead: {
						type: 'app-push',
						title: 'Northern lights',
						body: 'Latest coverage',
						link: `https://amp.theguardian.com/${articleId}`,
					},
				},
			},
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'lead' },
				},
			},
		});
		await notifications.create({
			...buildNotification(),
			kind: 'test',
			content: {
				items: {
					lead: {
						type: 'app-push',
						title: 'Test',
						body: 'Test',
						link: `https://www.theguardian.com/${articleId}`,
					},
				},
			},
		});
		await notifications.create({
			...buildNotification(),
			content: {
				items: {
					lead: {
						type: 'app-push',
						title: 'Different article',
						body: 'Different article',
						link: `https://www.theguardian.com/${articleId}-analysis`,
					},
				},
			},
		});

		const firstPage = await notifications.listArticleHistory({
			articleId,
			limit: 1,
			offset: 0,
		});
		expect(firstPage.total).toBe(2);
		expect(firstPage.sends).toHaveLength(1);
		expect(firstPage.sends[0]?.id).toBe(newerSend.id);
		expect(firstPage.sends[0]?.createdByEmail).toBe(
			'newer.sender@guardian.co.uk',
		);

		const secondPage = await notifications.listArticleHistory({
			articleId,
			limit: 1,
			offset: 1,
		});
		expect(secondPage.total).toBe(2);
		expect(secondPage.sends.map(({ id }) => id)).toEqual([olderSend.id]);
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

	it('filters by the channels included in a send', async () => {
		const appPush = await createHistoryNotification({
			appAlertType: 'breaking-news',
			createdAt: daysAgo(1),
		});
		const newsletter = await createHistoryNotification({
			subject: 'Daily briefing',
			createdAt: daysAgo(2),
		});
		const both = await createHistoryNotification({
			appAlertType: 'sport',
			subject: 'Sports briefing',
			createdAt: daysAgo(3),
		});

		const newsletterPage = await notifications.listRecent({
			since: daysAgo(14),
			channels: ['newsletter'],
		});
		expect(newsletterPage.notifications.map(({ id }) => id)).toEqual([
			newsletter.id,
			both.id,
		]);

		const appPushPage = await notifications.listRecent({
			since: daysAgo(14),
			channels: ['app-push'],
		});
		expect(appPushPage.notifications.map(({ id }) => id)).toEqual([
			appPush.id,
			both.id,
		]);

		const combinedPage = await notifications.listRecent({
			since: daysAgo(14),
			channels: ['newsletter', 'app-push'],
		});
		expect(combinedPage.total).toBe(3);
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
			createdByEmails: ['ada.lovelace@guardian.co.uk'],
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
			createdByEmails: ['ada.lovelace@GUARDIAN.co.uk'],
		});

		expect(page.total).toBe(1);
		expect(page.notifications.map((row) => row.id)).toEqual([mine.id]);
	});

	it('matches any selected sender', async () => {
		const newest = await notifications.create({
			...buildNotification(),
			createdByEmail: 'grace.hopper@guardian.co.uk',
			createdAt: daysAgo(1),
		});
		const oldest = await notifications.create({
			...buildNotification(),
			createdByEmail: 'ada.lovelace@guardian.co.uk',
			createdAt: daysAgo(2),
		});
		await notifications.create({
			...buildNotification(),
			createdByEmail: 'other@guardian.co.uk',
			createdAt: daysAgo(3),
		});

		const page = await notifications.listRecent({
			since: daysAgo(14),
			createdByEmails: [
				'ada.lovelace@guardian.co.uk',
				'grace.hopper@guardian.co.uk',
			],
		});

		expect(page.total).toBe(2);
		expect(page.notifications.map((row) => row.id)).toEqual([
			newest.id,
			oldest.id,
		]);
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
