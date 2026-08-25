import { describe, expect, it } from 'bun:test';
import type { NotificationDispatch } from '@database';
import type { DispatchOutcomes } from '../notification-channels/dispatch-notification';
import type { TestDispatchOutcomes } from '../notification-channels/dispatch-notification-test';
import {
	mapSendOutcomesToDispatches,
	mapTestOutcomesToDispatches,
	rollUpStatus,
	toPublicDispatch,
} from './persist-notification';

const notificationId = '11111111-1111-1111-1111-111111111111';

describe('rollUpStatus', () => {
	it('is accepted when there are no dispatches (e.g. a dry run)', () => {
		expect(rollUpStatus([])).toBe('accepted');
	});

	it('is delivered when every dispatch succeeded', () => {
		expect(
			rollUpStatus([
				{ notificationId, channel: 'app-push', target: 'a', status: 'success' },
				{
					notificationId,
					channel: 'newsletter',
					target: 'b',
					status: 'success',
				},
			]),
		).toBe('delivered');
	});

	it('is failed when every dispatch failed', () => {
		expect(
			rollUpStatus([
				{ notificationId, channel: 'app-push', target: 'a', status: 'failure' },
			]),
		).toBe('failed');
	});

	it('is partially_delivered on a mix of outcomes', () => {
		expect(
			rollUpStatus([
				{ notificationId, channel: 'app-push', target: 'a', status: 'success' },
				{
					notificationId,
					channel: 'newsletter',
					target: 'b',
					status: 'failure',
				},
			]),
		).toBe('partially_delivered');
	});
});

describe('mapSendOutcomesToDispatches', () => {
	it('maps app-push and newsletter outcomes to dispatch rows', () => {
		const outcomes: DispatchOutcomes = {
			appPush: [
				{
					notificationId,
					id: 'push-1',
					topicType: 'breaking-news',
					status: 'failure',
					failureReason: 'http_error',
					providerStatusCode: 500,
				},
			],
			newsletter: [
				{
					notificationId,
					segmentId: 'UK',
					campaignId: 'campaign-1',
					dispatchId: 'dispatch-1',
					status: 'success',
				},
			],
		};

		expect(mapSendOutcomesToDispatches(notificationId, outcomes)).toEqual([
			{
				notificationId,
				channel: 'app-push',
				target: 'breaking-news',
				providerRef: 'push-1',
				status: 'failure',
				failureReason: 'http_error',
				providerStatusCode: 500,
			},
			{
				notificationId,
				channel: 'newsletter',
				target: 'UK',
				providerRef: 'dispatch-1',
				status: 'success',
				failureReason: null,
				providerStatusCode: null,
				detail: { campaignId: 'campaign-1' },
			},
		]);
	});
});

describe('mapTestOutcomesToDispatches', () => {
	it('maps test outcomes to dispatch rows keyed by topic type and variant', () => {
		const outcomes: TestDispatchOutcomes = {
			appPush: [
				{
					testId: notificationId,
					id: 'push-1',
					topicType: 'test',
					status: 'success',
				},
			],
			newsletter: [
				{
					testId: notificationId,
					variant: 'UK',
					dispatchId: 'dispatch-1',
					status: 'success',
				},
			],
		};

		expect(mapTestOutcomesToDispatches(notificationId, outcomes)).toEqual([
			{
				notificationId,
				channel: 'app-push',
				target: 'test',
				providerRef: 'push-1',
				status: 'success',
				failureReason: null,
			},
			{
				notificationId,
				channel: 'newsletter',
				target: 'UK',
				providerRef: 'dispatch-1',
				status: 'success',
				failureReason: null,
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
			target: 'UK',
			providerRef: 'dispatch-1',
			status: 'success',
			failureReason: null,
			providerStatusCode: null,
			detail: { campaignId: 'campaign-1' },
			createdAt: new Date(0),
			updatedAt: new Date(0),
		};

		expect(toPublicDispatch(row)).toEqual({
			channel: 'newsletter',
			target: 'UK',
			status: 'success',
			providerRef: 'dispatch-1',
			failureReason: null,
			providerStatusCode: null,
		});
	});
});
