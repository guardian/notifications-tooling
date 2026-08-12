import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import { AppNotificationApiError } from '@services';
import type { NotificationSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import { dispatchNotification } from '../dispatch-notification';
import {
	anyString,
	baseRequest,
	createDependencies,
	notificationId,
	pushItem,
} from '../test-support';

describe('dispatchNotification app push', () => {
	it('sends a single push for one topic type with multiple editions', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [
							{ type: 'breaking-news', name: 'uk' },
							{ type: 'breaking-news', name: 'us' },
						],
					},
					compose: { use: 'lead' },
				},
			},
		};

		const outcomes = await dispatchNotification(
			request,
			notificationId,
			dependencies,
		);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledWith({
			endpoint: 'https://n10n.example.com',
			apiKey: 'test-n10n-key',
			timeoutMs: 10_000,
			id: anyString,
			sender: baseRequest.sender,
			title: pushItem.title,
			body: pushItem.body,
			link: pushItem.link,
			contentApiId: 'world/2026/jul/22/lead',
			importance: 'Major',
			topics: [
				{ type: 'breaking', name: 'uk' },
				{ type: 'breaking', name: 'us' },
			],
			media: undefined,
		});
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				status: 'success',
			},
		]);
	});

	it('sends one push per topic type when types are mixed', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [
							{ type: 'breaking-news', name: 'uk' },
							{ type: 'newsstand', name: 'ios' },
						],
					},
					compose: { use: 'lead' },
				},
			},
		};

		const outcomes = await dispatchNotification(
			request,
			notificationId,
			dependencies,
		);
		expect(sendAppNotification).toHaveBeenCalledTimes(2);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				id: anyString,
				importance: 'Major',
				topics: [{ type: 'breaking', name: 'uk' }],
			}),
		);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				id: anyString,
				importance: 'Minor',
				topics: [{ type: 'newsstand', name: 'newsstandIos' }],
			}),
		);
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				status: 'success',
			},
			{
				notificationId,
				id: anyString,
				topicType: 'newsstand',
				status: 'success',
			},
		]);
	});

	it('returns per-push outcomes with statuses when a push fails', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		let call = 0;
		sendAppNotification.mockImplementation(() => {
			call += 1;
			return call === 1
				? Promise.resolve({ id: 'n10n-id' })
				: Promise.reject(new AppNotificationApiError('http_error', 400));
		});
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [
							{ type: 'breaking-news', name: 'uk' },
							{ type: 'newsstand', name: 'ios' },
						],
					},
					compose: { use: 'lead' },
				},
			},
		};

		const outcomes = await dispatchNotification(
			request,
			notificationId,
			dependencies,
		);

		// Both pushes are attempted even though the first-listed one failed.
		expect(sendAppNotification).toHaveBeenCalledTimes(2);
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				status: 'success',
			},
			{
				notificationId,
				id: anyString,
				topicType: 'newsstand',
				status: 'failure',
				failureReason: 'http_error',
			},
		]);
	});

	it('derives Minor importance when no breaking-news edition is targeted', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'sport', name: 'uk' }],
					},
					compose: { use: 'lead' },
				},
			},
		};

		await dispatchNotification(request, notificationId, dependencies);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				id: anyString,
				importance: 'Minor',
				topics: [{ type: 'breaking', name: 'uk-sport' }],
			}),
		);
	});

	it('forwards optional media to the app-notification client', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const media = {
			type: 'image',
			imageUrl: 'https://i.guim.co.uk/lead.jpg',
			thumbnailUrl: 'https://i.guim.co.uk/thumb.jpg',
		} as const;
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: { ...pushItem, media } } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'lead' },
				},
			},
		};

		await dispatchNotification(request, notificationId, dependencies);
		expect(sendAppNotification).toHaveBeenCalledWith({
			endpoint: 'https://n10n.example.com',
			apiKey: 'test-n10n-key',
			timeoutMs: 10_000,
			id: anyString,
			sender: baseRequest.sender,
			title: pushItem.title,
			body: pushItem.body,
			link: pushItem.link,
			contentApiId: 'world/2026/jul/22/lead',
			importance: 'Major',
			topics: [{ type: 'breaking', name: 'uk' }],
			media,
		});
	});

	it('throws when a topic type/edition pair is not configured', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request = {
			...baseRequest,
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'mars' }],
					},
					compose: { use: 'lead' },
				},
			},
		} as unknown as NotificationSendRequest;

		let dispatchError: unknown;
		try {
			await dispatchNotification(request, notificationId, dependencies);
		} catch (error) {
			dispatchError = error;
		}

		expect(dispatchError).toEqual(
			new Error(
				"No push topic is configured for topic type 'breaking-news' edition 'mars'.",
			),
		);
		expect(sendAppNotification).not.toHaveBeenCalled();
	});
});
