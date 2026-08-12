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
import { dispatchAppPushTest } from './dispatch-test-app-push';

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

		const outcomes = await dispatchAppPushTest(
			testPushRequest(),
			testId,
			dependencies,
		);

		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				id: anyString,
				importance: 'Minor',
				topics: [{ type: 'breaking', name: 'internal-test' }],
			}),
		);
		expect(outcomes).toEqual([
			{ testId, id: anyString, topicType: 'test', status: 'success' },
		]);
	});

	it('resolves topics but sends nothing on a dry run', async () => {
		const { dependencies, sendAppNotification } = createDependencies();

		const outcomes = await dispatchAppPushTest(
			testPushRequest({ options: { dryRun: true } }),
			testId,
			dependencies,
		);

		expect(outcomes).toEqual([]);
		expect(sendAppNotification).not.toHaveBeenCalled();
	});

	it('reports a failure reason when the push fails', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		sendAppNotification.mockRejectedValue(
			new AppNotificationApiError('http_error', 400),
		);

		const outcomes = await dispatchAppPushTest(
			testPushRequest(),
			testId,
			dependencies,
		);

		expect(outcomes).toEqual([
			{
				testId,
				id: anyString,
				topicType: 'test',
				status: 'failure',
				failureReason: 'http_error',
			},
		]);
	});

	it('returns nothing when no app-push channel is present', async () => {
		const { dependencies, sendAppNotification } = createDependencies();

		const outcomes = await dispatchAppPushTest(
			testPushRequest({ channels: {} }),
			testId,
			dependencies,
		);

		expect(outcomes).toEqual([]);
		expect(sendAppNotification).not.toHaveBeenCalled();
	});
});
