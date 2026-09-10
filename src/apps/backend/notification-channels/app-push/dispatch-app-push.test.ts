import { describe, expect, it } from 'bun:test';
import { NotificationChannel } from '@config';
import { AppNotificationApiError } from '@services';
import type { NotificationSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import { dispatchNotification } from '../dispatch-notification';
import {
	anyString,
	baseRequest,
	createdByEmail,
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
			createdByEmail,
			dependencies,
		);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledWith({
			endpoint: 'https://n10n.example.com',
			apiKey: 'test-n10n-key',
			timeoutMs: 10_000,
			id: anyString,
			sender: createdByEmail,
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
				requested: {
					channel: 'app-push',
					topicType: 'breaking-news',
					editions: ['uk', 'us'],
				},
				resolved: {
					channel: 'app-push',
					topics: [
						{ type: 'breaking', name: 'internal-dispatch-test' },
						{ type: 'breaking', name: 'internal-dispatch-test' },
					],
					importance: 'Major',
				},
				status: 'success',
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
		]);
	});

	it('forwards the liveblog block id derived from a block link', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: {
				items: {
					lead: {
						...pushItem,
						link: 'https://www.theguardian.com/politics/live/2026/jul/19/election-live?page=with:block-5dd7ca0f8f080fd59fb15354',
					},
				},
			},
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

		await dispatchNotification(
			request,
			notificationId,
			createdByEmail,
			dependencies,
		);

		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				contentApiId: 'politics/live/2026/jul/19/election-live',
				blockId: '5dd7ca0f8f080fd59fb15354',
			}),
		);
	});

	it('records the block id in the resolved dispatch outcome', async () => {
		const { dependencies } = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: {
				items: {
					lead: {
						...pushItem,
						link: 'https://www.theguardian.com/politics/live/2026/jul/19/election-live?page=with:block-5dd7ca0f8f080fd59fb15354',
					},
				},
			},
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

		const outcomes = await dispatchNotification(
			request,
			notificationId,
			createdByEmail,
			dependencies,
		);

		expect(outcomes.appPush[0]?.resolved).toEqual({
			channel: 'app-push',
			topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
			importance: 'Major',
			blockId: '5dd7ca0f8f080fd59fb15354',
		});
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
			createdByEmail,
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
				requested: {
					channel: 'app-push',
					topicType: 'breaking-news',
					editions: ['uk'],
				},
				resolved: {
					channel: 'app-push',
					topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
					importance: 'Major',
				},
				status: 'success',
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
			{
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
				providerRef: anyString,
				failureReason: null,
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
			resolveAppPushDispatch(request, createdByEmail),
			notificationId,
			dependencies,
		);

		// Both pushes are attempted even though the first-listed one failed.
		expect(sendAppNotification).toHaveBeenCalledTimes(2);
		expect(outcomes).toEqual([
			{
				requested: {
					channel: 'app-push',
					topicType: 'breaking-news',
					editions: ['uk'],
				},
				resolved: {
					channel: 'app-push',
					topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
					importance: 'Major',
				},
				status: 'success',
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
			{
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
				status: 'failure',
				providerRef: anyString,
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

		await dispatchNotification(
			request,
			notificationId,
			createdByEmail,
			dependencies,
		);
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

		await dispatchNotification(
			request,
			notificationId,
			createdByEmail,
			dependencies,
		);
		expect(sendAppNotification).toHaveBeenCalledWith({
			endpoint: 'https://n10n.example.com',
			apiKey: 'test-n10n-key',
			timeoutMs: 10_000,
			id: anyString,
			sender: createdByEmail,
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
			await dispatchNotification(
				request,
				notificationId,
				createdByEmail,
				dependencies,
			);
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

	it('sends sport editions with their regional titles', async () => {
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
			createdByEmail,
			dependencies,
		);

		// The regional titles split UK and US into separate pushes.
		expect(sendAppNotification).toHaveBeenCalledTimes(2);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Sport news',
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
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
			{
				requested: {
					channel: 'app-push',
					topicType: 'sport',
					editions: ['us'],
				},
				resolved: {
					channel: 'app-push',
					topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
					importance: 'Minor',
				},
				status: 'success',
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
		]);
	});

	it('splits sport editions by regional title when mixed with other topic types', async () => {
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
			createdByEmail,
			dependencies,
		);

		// breaking-news (1) + grouped uk/au sport (1) + US sport (1).
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
				title: 'Sport news',
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
				requested: {
					channel: 'app-push',
					topicType: 'breaking-news',
					editions: ['uk'],
				},
				resolved: {
					channel: 'app-push',
					topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
					importance: 'Major',
				},
				status: 'success',
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
			{
				requested: {
					channel: 'app-push',
					topicType: 'sport',
					editions: ['uk', 'au'],
				},
				resolved: {
					channel: 'app-push',
					topics: [
						{ type: 'breaking', name: 'internal-dispatch-test' },
						{ type: 'breaking', name: 'internal-dispatch-test' },
					],
					importance: 'Minor',
				},
				status: 'success',
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
			{
				requested: {
					channel: 'app-push',
					topicType: 'sport',
					editions: ['us'],
				},
				resolved: {
					channel: 'app-push',
					topics: [{ type: 'breaking', name: 'internal-dispatch-test' }],
					importance: 'Minor',
				},
				status: 'success',
				providerRef: anyString,
				failureReason: null,
				providerStatusCode: 201,
			},
		]);
	});
});
