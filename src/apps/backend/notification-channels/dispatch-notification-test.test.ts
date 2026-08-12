import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import type { NotificationTestSendRequest } from '../routers/notifications/schemas/notification-send-request';
import { dispatchNotificationTest } from './dispatch-notification-test';
import {
	anyString,
	createDependencies,
	newsletterItem,
	pushItem,
	testId,
} from './test-support';

describe('dispatchNotificationTest', () => {
	it('dispatches newsletter and app-push test channels together', async () => {
		const { dependencies, sendBrazeTestEmail, sendAppNotification } =
			createDependencies();
		const request: NotificationTestSendRequest = {
			idempotencyKey: 'test-combined',
			sender: 'dispatch-test',
			options: { dryRun: false },
			content: { items: { news: newsletterItem, push: pushItem } },
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: { type: 'email', items: ['editor@theguardian.com'] },
					variants: ['UK'],
					compose: { items: ['news'], subject: '[TEST] Briefing' },
				},
				[NotificationChannel.AppPushNotification]: {
					audience: { type: 'topic', items: [{ type: 'test', name: 'test' }] },
					compose: { use: 'push' },
				},
			},
		};

		const outcomes = await dispatchNotificationTest(
			request,
			testId,
			dependencies,
		);

		expect(sendBrazeTestEmail).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(outcomes.newsletter).toEqual([
			{
				testId,
				variant: 'UK',
				dispatchId: 'test-dispatch-123',
				status: 'success',
			},
		]);
		expect(outcomes.appPush).toEqual([
			{ testId, id: anyString, topicType: 'test', status: 'success' },
		]);
	});

	it('returns empty per-channel outcomes when only one channel is present', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request: NotificationTestSendRequest = {
			idempotencyKey: 'test-push-only',
			sender: 'dispatch-test',
			options: { dryRun: false },
			content: { items: { push: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: { type: 'topic', items: [{ type: 'test', name: 'test' }] },
					compose: { use: 'push' },
				},
			},
		};

		const outcomes = await dispatchNotificationTest(
			request,
			testId,
			dependencies,
		);

		expect(outcomes.newsletter).toEqual([]);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(outcomes.appPush).toHaveLength(1);
	});
});
