import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import { BrazeApiError, BrazePushRecipientNotFoundError } from '@services';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import { createDependencies, pushItem, testId } from '../test-support';
import { dispatchAppPushTest } from './dispatch-app-push-test';

const testPushRequest = (
	overrides: Partial<NotificationTestSendRequest> = {},
): NotificationTestSendRequest => ({
	idempotencyKey: 'test-push',
	sender: 'dispatch-test',
	options: { dryRun: false },
	content: { items: { lead: pushItem } },
	channels: {
		[NotificationChannel.AppPushNotification]: {
			audience: { type: 'email', items: ['Editor@guardian.co.uk'] },
			compose: { use: 'lead' },
		},
	},
	...overrides,
});

describe('dispatchAppPushTest', () => {
	it('resolves recipient emails and sends a test push through Braze', async () => {
		const { dependencies, findBrazePushRecipient, sendBrazeTestPush } =
			createDependencies();

		const { outcomes } = await dispatchAppPushTest(
			testPushRequest({
				content: {
					items: {
						lead: {
							...pushItem,
							media: {
								type: 'image',
								imageUrl: 'https://media.guim.co.uk/lead.jpg',
								thumbnailUrl: 'https://media.guim.co.uk/thumb.jpg',
							},
						},
					},
				},
			}),
			testId,
			dependencies,
		);

		expect(findBrazePushRecipient).toHaveBeenCalledWith({
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			timeoutMs: 10_000,
			recipientEmail: 'editor@guardian.co.uk',
		});
		expect(sendBrazeTestPush).toHaveBeenCalledWith({
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			timeoutMs: 10_000,
			externalUserIds: ['external-editor@guardian.co.uk'],
			notificationId: testId,
			title: 'Breaking news',
			body: 'Lead summary',
			link: 'https://www.theguardian.com/world/2026/jul/22/lead',
			appleDeepLink: 'gnmguardian://world/2026/jul/22/lead',
			imageUrl: 'https://media.guim.co.uk/thumb.jpg',
		});
		expect(outcomes).toEqual([
			{
				testId,
				recipientEmail: 'editor@guardian.co.uk',
				externalUserId: 'external-editor@guardian.co.uk',
				dispatchId: 'push-dispatch-123',
				status: 'success',
			},
		]);
	});

	it('dispatches even when dryRun is set (gating is the orchestrator’s job)', async () => {
		const { dependencies, sendBrazeTestPush } = createDependencies();

		const { outcomes } = await dispatchAppPushTest(
			testPushRequest({ options: { dryRun: true } }),
			testId,
			dependencies,
		);

		expect(sendBrazeTestPush).toHaveBeenCalledTimes(1);
		expect(outcomes).toEqual([
			{
				testId,
				recipientEmail: 'editor@guardian.co.uk',
				externalUserId: 'external-editor@guardian.co.uk',
				dispatchId: 'push-dispatch-123',
				status: 'success',
			},
		]);
	});

	it('reports a failure reason and surfaces the error when the push fails', async () => {
		const { dependencies, sendBrazeTestPush } = createDependencies();
		const pushError = new BrazeApiError('test push send', 'http_error', 400);
		sendBrazeTestPush.mockRejectedValue(pushError);

		const { outcomes, error } = await dispatchAppPushTest(
			testPushRequest(),
			testId,
			dependencies,
		);

		expect(outcomes).toEqual([
			{
				testId,
				recipientEmail: 'editor@guardian.co.uk',
				externalUserId: 'external-editor@guardian.co.uk',
				status: 'failure',
				failureReason: 'http_error',
			},
		]);
		// The failure is surfaced so the orchestrator can rethrow it as a 502/504.
		expect(error).toBe(pushError);
	});

	it('rejects a recipient without a push-capable Braze profile before sending', async () => {
		const { dependencies, findBrazePushRecipient, sendBrazeTestPush } =
			createDependencies();
		findBrazePushRecipient.mockResolvedValue(undefined);

		let dispatchError: unknown;
		try {
			await dispatchAppPushTest(testPushRequest(), testId, dependencies);
		} catch (error) {
			dispatchError = error;
		}
		expect(dispatchError).toBeInstanceOf(BrazePushRecipientNotFoundError);
		expect(sendBrazeTestPush).not.toHaveBeenCalled();
	});

	it('returns nothing when no app-push channel is present', async () => {
		const { dependencies, sendBrazeTestPush } = createDependencies();

		const { outcomes } = await dispatchAppPushTest(
			testPushRequest({ channels: {} }),
			testId,
			dependencies,
		);

		expect(outcomes).toEqual([]);
		expect(sendBrazeTestPush).not.toHaveBeenCalled();
	});
});
