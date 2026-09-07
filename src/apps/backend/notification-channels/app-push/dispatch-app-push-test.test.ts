import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import { AppNotificationApiError } from '@services';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import {
	anyString,
	createDependencies,
	pushItem,
	testId,
} from '../test-support';
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
			audience: { type: 'topic', items: [{ type: 'test', name: 'test' }] },
			compose: { use: 'lead' },
		},
	},
	...overrides,
});

describe('dispatchAppPushTest', () => {
	it('sends a test push to the internal test topic', async () => {
		const { dependencies, sendAppNotification } = createDependencies();

		const { outcomes } = await dispatchAppPushTest(
			testPushRequest(),
			testId,
			dependencies,
		);

		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				id: anyString,
				importance: 'Minor',
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
		expect(outcomes).toEqual([
			{
				testId,
				id: anyString,
				topicType: 'test',
				editions: ['test'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Minor',
				status: 'success',
				providerStatusCode: 201,
			},
		]);
	});

	it('dispatches even when dryRun is set (gating is the orchestrator’s job)', async () => {
		const { dependencies, sendAppNotification } = createDependencies();

		const { outcomes } = await dispatchAppPushTest(
			testPushRequest({ options: { dryRun: true } }),
			testId,
			dependencies,
		);

		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(outcomes).toEqual([
			{
				testId,
				id: anyString,
				topicType: 'test',
				editions: ['test'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Minor',
				status: 'success',
				providerStatusCode: 201,
			},
		]);
	});

	it('reports a failure reason and surfaces the error when the push fails', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const pushError = new AppNotificationApiError('http_error', 400);
		sendAppNotification.mockRejectedValue(pushError);

		const { outcomes, error } = await dispatchAppPushTest(
			testPushRequest(),
			testId,
			dependencies,
		);

		expect(outcomes).toEqual([
			{
				testId,
				id: anyString,
				topicType: 'test',
				editions: ['test'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Minor',
				status: 'failure',
				failureReason: 'http_error',
				providerStatusCode: 400,
			},
		]);
		// The failure is surfaced so the orchestrator can rethrow it as a 502/504.
		expect(error).toBe(pushError);
	});

	it('returns nothing when no app-push channel is present', async () => {
		const { dependencies, sendAppNotification } = createDependencies();

		const { outcomes } = await dispatchAppPushTest(
			testPushRequest({ channels: {} }),
			testId,
			dependencies,
		);

		expect(outcomes).toEqual([]);
		expect(sendAppNotification).not.toHaveBeenCalled();
	});
});
