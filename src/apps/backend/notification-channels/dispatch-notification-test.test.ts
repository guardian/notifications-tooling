import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import { AppNotificationApiError } from '@services';
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
				providerStatusCode: 201,
			},
		]);
		expect(outcomes.appPush).toEqual([
			{
				testId,
				id: anyString,
				topicType: 'test',
				status: 'success',
				providerStatusCode: 201,
			},
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

	it('short-circuits a dry run without dispatching either channel', async () => {
		const {
			dependencies,
			renderEmail,
			registerBrazeTestEmailRecipients,
			sendBrazeTestEmail,
			sendAppNotification,
		} = createDependencies();
		const request: NotificationTestSendRequest = {
			idempotencyKey: 'test-dry-run',
			sender: 'dispatch-test',
			options: { dryRun: true },
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

		expect(outcomes).toEqual({ newsletter: [], appPush: [] });
		expect(renderEmail).not.toHaveBeenCalled();
		expect(registerBrazeTestEmailRecipients).not.toHaveBeenCalled();
		expect(sendBrazeTestEmail).not.toHaveBeenCalled();
		expect(sendAppNotification).not.toHaveBeenCalled();
	});

	it('surfaces a provider failure while still attempting the other channel', async () => {
		const { dependencies, sendBrazeTestEmail, sendAppNotification } =
			createDependencies();
		const pushError = new AppNotificationApiError('timeout');
		sendAppNotification.mockRejectedValue(pushError);
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

		// The push failure is returned (not thrown) so the router can persist every
		// outcome, then surface the documented 502/504 instead of a false 202.
		const { error } = await dispatchNotificationTest(
			request,
			testId,
			dependencies,
		);

		expect(error).toBe(pushError);

		// Neither channel aborts the other: the newsletter is still attempted.
		expect(sendBrazeTestEmail).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
	});
});
