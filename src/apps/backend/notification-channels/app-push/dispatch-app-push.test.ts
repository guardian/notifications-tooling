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
import { dispatchAppPush, resolveAppPushDispatch } from './dispatch-app-push';

describe('dispatchNotification (app-push channel)', () => {
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
				{ type: 'breaking', name: 'internal-dispatch-test' },
				{ type: 'breaking', name: 'internal-dispatch-test' },
			],
			media: undefined,
		});
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				editions: ['uk', 'us'],
				topics: [
					{ type: 'breaking', name: 'internal-dispatch-test' },
					{ type: 'breaking', name: 'internal-dispatch-test' },
				],
				importance: 'Major',
				status: 'success',
				providerStatusCode: 201,
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
							{ type: 'sport', name: 'uk' },
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
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				id: anyString,
				importance: 'Minor',
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				editions: ['uk'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Major',
				status: 'success',
				providerStatusCode: 201,
			},
			{
				notificationId,
				id: anyString,
				topicType: 'sport',
				editions: ['uk'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Minor',
				status: 'success',
				providerStatusCode: 201,
			},
		]);
	});

	it('returns per-push outcomes and surfaces the error when a push fails', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const pushError = new AppNotificationApiError('http_error', 400);
		let call = 0;
		sendAppNotification.mockImplementation(() => {
			call += 1;
			return call === 1
				? Promise.resolve({ id: 'n10n-id', status: 201 })
				: Promise.reject(pushError);
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
							{ type: 'sport', name: 'uk' },
						],
					},
					compose: { use: 'lead' },
				},
			},
		};

		const { outcomes, error } = await dispatchAppPush(
			resolveAppPushDispatch(request),
			notificationId,
			dependencies,
		);

		// Both pushes are attempted even though the first-listed one failed.
		expect(sendAppNotification).toHaveBeenCalledTimes(2);
		expect(outcomes).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				editions: ['uk'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Major',
				status: 'success',
				providerStatusCode: 201,
			},
			{
				notificationId,
				id: anyString,
				topicType: 'sport',
				editions: ['uk'],
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
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
	});

	it('forwards optional media to the mobile-n10n client', async () => {
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
			topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
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

	it('sends the US sport edition as its own push with the overridden title', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [
							{ type: 'sport', name: 'uk' },
							{ type: 'sport', name: 'us' },
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

		// The override splits US out of the generic sport group into its own push.
		expect(sendAppNotification).toHaveBeenCalledTimes(2);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: pushItem.title,
				importance: 'Minor',
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Sports news',
				importance: 'Minor',
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'sport',
				editions: ['uk'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Minor',
				status: 'success',
				providerStatusCode: 201,
			},
			{
				notificationId,
				id: anyString,
				topicType: 'sport',
				editions: ['us'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Minor',
				status: 'success',
				providerStatusCode: 201,
			},
		]);
	});

	it('splits the overridden US sport edition out when mixed with other topic types and sport editions', async () => {
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
							{ type: 'sport', name: 'uk' },
							{ type: 'sport', name: 'us' },
							{ type: 'sport', name: 'au' },
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

		// breaking-news (1) + grouped uk/au sport (1) + overridden us sport (1).
		expect(sendAppNotification).toHaveBeenCalledTimes(3);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: pushItem.title,
				importance: 'Major',
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: pushItem.title,
				importance: 'Minor',
				topics: [
					{ type: 'breaking', name: 'internal-dispatch-test' },
					{ type: 'breaking', name: 'internal-dispatch-test' },
				],
			}),
		);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Sports news',
				importance: 'Minor',
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			}),
		);
		expect(outcomes.appPush).toEqual([
			{
				notificationId,
				id: anyString,
				topicType: 'breaking-news',
				editions: ['uk'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Major',
				status: 'success',
				providerStatusCode: 201,
			},
			{
				notificationId,
				id: anyString,
				topicType: 'sport',
				editions: ['uk', 'au'],
				topics: [
					{ type: 'breaking', name: 'internal-dispatch-test' },
					{ type: 'breaking', name: 'internal-dispatch-test' },
				],
				importance: 'Minor',
				status: 'success',
				providerStatusCode: 201,
			},
			{
				notificationId,
				id: anyString,
				topicType: 'sport',
				editions: ['us'],
				topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
				importance: 'Minor',
				status: 'success',
				providerStatusCode: 201,
			},
		]);
	});
});
