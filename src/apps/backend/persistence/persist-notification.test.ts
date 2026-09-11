import { describe, expect, it } from 'bun:test';
import type { NewNotificationDispatch, NotificationDispatch } from '@database';
import type { DispatchOutcomes } from '../notification-channels/dispatch-notification';
import type { TestDispatchOutcomes } from '../notification-channels/dispatch-notification-test';
import {
	collectFailedTargets,
	httpStatusForNotification,
	mapOutcomesToDispatches,
	rollUpStatus,
	toNotificationResponse,
	toPublicDispatch,
} from './persist-notification';

const notificationId = '11111111-1111-1111-1111-111111111111';

const appPushRow = (
	status: 'success' | 'failure',
): NewNotificationDispatch => ({
	notificationId,
	channel: 'app-push',
	requested: {
		channel: 'app-push',
		topicType: 'breaking-news',
		editions: ['uk'],
	},
	resolved: {
		channel: 'app-push',
		topics: [{ type: 'breaking', name: 'uk' }],
		importance: 'Major',
	},
	status,
});

const newsletterRow = (
	status: 'success' | 'failure',
): NewNotificationDispatch => ({
	notificationId,
	channel: 'newsletter',
	requested: { channel: 'newsletter', segment: 'UK' },
	resolved: { channel: 'newsletter', emailRenderingId: 'newsletter-1' },
	status,
});

describe('httpStatusForNotification', () => {
	it('maps each rolled-up status to its HTTP code', () => {
		expect(httpStatusForNotification('accepted')).toBe(202);
		expect(httpStatusForNotification('delivered')).toBe(201);
		expect(httpStatusForNotification('partially_delivered')).toBe(502);
		expect(httpStatusForNotification('failed')).toBe(502);
	});
});

describe('rollUpStatus', () => {
	it('is accepted when there are no dispatches (e.g. a dry run)', () => {
		expect(rollUpStatus([])).toBe('accepted');
	});

	it('is delivered when every dispatch succeeded', () => {
		expect(
			rollUpStatus([appPushRow('success'), newsletterRow('success')]),
		).toBe('delivered');
	});

	it('is failed when every dispatch failed', () => {
		expect(rollUpStatus([appPushRow('failure')])).toBe('failed');
	});

	it('is failed when any dispatch failed', () => {
		expect(
			rollUpStatus([appPushRow('success'), newsletterRow('failure')]),
		).toBe('failed');
	});
});

describe('collectFailedTargets', () => {
	it('is empty when nothing failed', () => {
		expect(collectFailedTargets([appPushRow('success')])).toEqual({
			topics: [],
			segments: [],
		});
	});

	it('groups failed targets by channel and ignores successes', () => {
		expect(
			collectFailedTargets([
				{
					notificationId,
					channel: 'app-push',
					requested: {
						channel: 'app-push',
						topicType: 'breaking-news',
						editions: ['uk', 'us'],
					},
					resolved: {
						channel: 'app-push',
						topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
						importance: 'Major',
					},
					status: 'failure',
				},
				{
					notificationId,
					channel: 'app-push',
					requested: {
						channel: 'app-push',
						topicType: 'sport',
						editions: ['uk'],
					},
					resolved: {
						channel: 'app-push',
						topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
						importance: 'Minor',
					},
					status: 'success',
				},
				{
					notificationId,
					channel: 'newsletter',
					requested: { channel: 'newsletter', segment: 'UK' },
					resolved: { channel: 'newsletter', emailRenderingId: 'newsletter-1' },
					status: 'failure',
				},
				{
					notificationId,
					channel: 'newsletter',
					requested: { channel: 'newsletter', segment: 'US' },
					resolved: { channel: 'newsletter', emailRenderingId: 'newsletter-2' },
					status: 'success',
				},
			]),
		).toEqual({
			topics: [
				{ topicType: 'breaking-news', edition: 'uk' },
				{ topicType: 'breaking-news', edition: 'us' },
			],
			segments: [{ segmentId: 'UK' }],
		});
	});
});

describe('mapOutcomesToDispatches (send outcomes)', () => {
	it('maps app-push and newsletter outcomes to dispatch rows', () => {
		const outcomes: DispatchOutcomes = {
			appPush: [
				{
					requested: {
						channel: 'app-push',
						topicType: 'breaking-news',
						editions: ['uk'],
					},
					resolved: {
						channel: 'app-push',
						topics: [{ type: 'breaking', name: 'uk' }],
						importance: 'Major',
					},
					status: 'failure',
					providerRef: 'push-1',
					failureReason: 'http_error',
					providerStatusCode: 500,
				},
			],
			newsletter: [
				{
					requested: { channel: 'newsletter', segment: 'UK' },
					resolved: {
						channel: 'newsletter',
						brazeCampaignId: 'campaign-1',
						emailRenderingId: 'newsletter-1',
					},
					status: 'success',
					providerRef: 'dispatch-1',
					failureReason: null,
					providerStatusCode: null,
				},
			],
		};

		expect(mapOutcomesToDispatches(notificationId, outcomes)).toEqual([
			{
				notificationId,
				channel: 'app-push',
				requested: {
					channel: 'app-push',
					topicType: 'breaking-news',
					editions: ['uk'],
				},
				resolved: {
					channel: 'app-push',
					topics: [{ type: 'breaking', name: 'uk' }],
					importance: 'Major',
				},
				providerRef: 'push-1',
				status: 'failure',
				failureReason: 'http_error',
				providerStatusCode: 500,
			},
			{
				notificationId,
				channel: 'newsletter',
				requested: { channel: 'newsletter', segment: 'UK' },
				resolved: {
					channel: 'newsletter',
					brazeCampaignId: 'campaign-1',
					emailRenderingId: 'newsletter-1',
				},
				providerRef: 'dispatch-1',
				status: 'success',
				failureReason: null,
				providerStatusCode: null,
			},
		]);
	});
});

describe('mapOutcomesToDispatches (test outcomes)', () => {
	it('maps test outcomes to dispatch rows keyed by topic type and segment', () => {
		const outcomes: TestDispatchOutcomes = {
			appPush: [
				{
					requested: {
						channel: 'app-push',
						topicType: 'test',
						editions: ['test'],
					},
					resolved: {
						channel: 'app-push',
						topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
						importance: 'Minor',
					},
					status: 'success',
					providerRef: 'push-1',
					failureReason: null,
					providerStatusCode: 201,
				},
			],
			newsletter: [
				{
					requested: { channel: 'newsletter', segment: 'UK' },
					resolved: {
						channel: 'newsletter',
						emailRenderingId: 'newsletter-1',
					},
					status: 'success',
					providerRef: 'dispatch-1',
					failureReason: null,
					providerStatusCode: 201,
				},
			],
		};

		expect(mapOutcomesToDispatches(notificationId, outcomes)).toEqual([
			{
				notificationId,
				channel: 'app-push',
				requested: {
					channel: 'app-push',
					topicType: 'test',
					editions: ['test'],
				},
				resolved: {
					channel: 'app-push',
					topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
					importance: 'Minor',
				},
				providerRef: 'push-1',
				status: 'success',
				failureReason: null,
				providerStatusCode: 201,
			},
			{
				notificationId,
				channel: 'newsletter',
				requested: { channel: 'newsletter', segment: 'UK' },
				resolved: {
					channel: 'newsletter',
					emailRenderingId: 'newsletter-1',
				},
				providerRef: 'dispatch-1',
				status: 'success',
				failureReason: null,
				providerStatusCode: 201,
			},
		]);
	});
});

describe('toPublicDispatch', () => {
	it('projects a persisted dispatch row to its client-facing shape', () => {
		const row: NotificationDispatch = {
			id: '22222222-2222-2222-2222-222222222222',
			notificationId,
			channel: 'newsletter',
			requested: { channel: 'newsletter', segment: 'UK' },
			resolved: {
				channel: 'newsletter',
				brazeCampaignId: 'campaign-1',
				emailRenderingId: 'newsletter-1',
			},
			providerRef: 'dispatch-1',
			status: 'success',
			failureReason: null,
			providerStatusCode: null,
			createdAt: new Date(0),
			updatedAt: new Date(0),
		};

		expect(toPublicDispatch(row)).toEqual({
			id: '22222222-2222-2222-2222-222222222222',
			channel: 'newsletter',
			requested: { channel: 'newsletter', segment: 'UK' },
			resolved: {
				channel: 'newsletter',
				brazeCampaignId: 'campaign-1',
				emailRenderingId: 'newsletter-1',
			},
			status: 'success',
			providerRef: 'dispatch-1',
			failureReason: null,
			providerStatusCode: null,
			createdAt: '1970-01-01T00:00:00.000Z',
			updatedAt: '1970-01-01T00:00:00.000Z',
		});
	});
});

describe('toNotificationResponse', () => {
	it('serialises the persisted notification and its dispatches', () => {
		expect(
			toNotificationResponse({
				notification: {
					id: notificationId,
					idempotencyKey: 'idem-1',
					kind: 'send',
					status: 'delivered',
					sender: 'notifications-tooling-spa/v1',
					createdByEmail: 'ada.lovelace@guardian.co.uk',
					dryRun: false,
					scheduledFor: null,
					content: {},
					channels: {},
					failedTargets: { topics: [], segments: [] },
					createdAt: new Date('2026-08-25T00:00:00.000Z'),
					updatedAt: new Date('2026-08-25T00:00:00.000Z'),
				},
				dispatches: [
					{
						id: '22222222-2222-2222-2222-222222222222',
						notificationId,
						channel: 'app-push',
						requested: {
							channel: 'app-push',
							topicType: 'breaking-news',
							editions: ['uk'],
						},
						resolved: {
							channel: 'app-push',
							topics: [{ type: 'breaking', name: 'uk' }],
							importance: 'Major',
						},
						providerRef: 'push-1',
						status: 'success',
						failureReason: null,
						providerStatusCode: null,
						createdAt: new Date(0),
						updatedAt: new Date(0),
					},
				],
			}),
		).toEqual({
			id: notificationId,
			idempotencyKey: 'idem-1',
			kind: 'send',
			status: 'delivered',
			sender: 'notifications-tooling-spa/v1',
			createdByEmail: 'ada.lovelace@guardian.co.uk',
			dryRun: false,
			scheduledFor: null,
			content: {},
			channels: {},
			failedTargets: { topics: [], segments: [] },
			createdAt: '2026-08-25T00:00:00.000Z',
			updatedAt: '2026-08-25T00:00:00.000Z',
			dispatches: [
				{
					id: '22222222-2222-2222-2222-222222222222',
					channel: 'app-push',
					requested: {
						channel: 'app-push',
						topicType: 'breaking-news',
						editions: ['uk'],
					},
					resolved: {
						channel: 'app-push',
						topics: [{ type: 'breaking', name: 'uk' }],
						importance: 'Major',
					},
					status: 'success',
					providerRef: 'push-1',
					failureReason: null,
					providerStatusCode: null,
					createdAt: '1970-01-01T00:00:00.000Z',
					updatedAt: '1970-01-01T00:00:00.000Z',
				},
			],
		});
	});

	it('serialises scheduledFor as an ISO string when set', () => {
		const response = toNotificationResponse({
			notification: {
				id: notificationId,
				idempotencyKey: 'idem-1',
				kind: 'send',
				status: 'accepted',
				sender: 'notifications-tooling-spa/v1',
				createdByEmail: 'ada.lovelace@guardian.co.uk',
				dryRun: false,
				scheduledFor: new Date('2026-09-01T09:00:00.000Z'),
				content: {},
				channels: {},
				failedTargets: { topics: [], segments: [] },
				createdAt: new Date('2026-08-25T00:00:00.000Z'),
				updatedAt: new Date('2026-08-25T00:00:00.000Z'),
			},
			dispatches: [],
		});

		expect(response.scheduledFor).toBe('2026-09-01T09:00:00.000Z');
	});
});
