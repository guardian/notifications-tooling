import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import { BrazeApiError } from '@services';
import type { NotificationTestSendRequest } from '../routers/notifications/schemas/notification-send-request';
import { dispatchNotificationTest } from './dispatch-notification-test';
import { createDependencies, newsletterItem, pushItem, testId } from './test-support';

describe('dispatchNotificationTest', () => {
	it('dispatches newsletter and app-push test channels together', async () => {
		const { dependencies, sendBrazeTestEmail, sendBrazeTestPush } =
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
					audience: { type: 'email', items: ['editor@theguardian.com'] },
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
		expect(sendBrazeTestPush).toHaveBeenCalledTimes(1);
		expect(outcomes.newsletter).toEqual([
			{
				testId,
				variant: 'UK',
				dispatchId: 'test-dispatch-123',
				status: 'success',
			},
		]);
		expect(outcomes.appPush).toEqual([
			{
				testId,
				recipientEmail: 'editor@theguardian.com',
				externalUserId: 'external-editor@theguardian.com',
				dispatchId: 'push-dispatch-123',
				status: 'success',
			},
		]);
	});

	it('returns empty per-channel outcomes when only one channel is present', async () => {
		const { dependencies, sendBrazeTestPush } = createDependencies();
		const request: NotificationTestSendRequest = {
			idempotencyKey: 'test-push-only',
			sender: 'dispatch-test',
			options: { dryRun: false },
			content: { items: { push: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: { type: 'email', items: ['editor@theguardian.com'] },
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
		expect(sendBrazeTestPush).toHaveBeenCalledTimes(1);
		expect(outcomes.appPush).toHaveLength(1);
	});

	it('short-circuits a dry run without dispatching either channel', async () => {
		const {
			dependencies,
			renderEmail,
			registerBrazeTestEmailRecipients,
			sendBrazeTestEmail,
			findBrazePushRecipient,
			sendBrazeTestPush,
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
					audience: { type: 'email', items: ['editor@theguardian.com'] },
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
		expect(findBrazePushRecipient).not.toHaveBeenCalled();
		expect(sendBrazeTestPush).not.toHaveBeenCalled();
	});

	it('surfaces a provider failure while still attempting the other channel', async () => {
		const { dependencies, sendBrazeTestEmail, sendBrazeTestPush } =
			createDependencies();
		const pushError = new BrazeApiError('test push send', 'timeout');
		sendBrazeTestPush.mockRejectedValue(pushError);
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
					audience: { type: 'email', items: ['editor@theguardian.com'] },
					compose: { use: 'push' },
				},
			},
		};

		// The push failure is rethrown so the endpoint returns the documented
		// 502/504 instead of a false 202.
		let dispatchError: unknown;
		try {
			await dispatchNotificationTest(request, testId, dependencies);
		} catch (error) {
			dispatchError = error;
		}

		expect(dispatchError).toBe(pushError);

		// Neither channel aborts the other: the newsletter is still attempted.
		expect(sendBrazeTestEmail).toHaveBeenCalledTimes(1);
		expect(sendBrazeTestPush).toHaveBeenCalledTimes(1);
	});
});
