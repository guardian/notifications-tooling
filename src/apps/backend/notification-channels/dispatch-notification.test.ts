import { describe, expect, it, mock } from 'bun:test';
import { newsletterSegments, NotificationChannel } from '@config';
import { AppNotificationApiError } from '@services';
import type {
	NotificationSendRequest,
	NotificationTestSendRequest,
} from '../routers/notifications/schemas/notification-send-request';
import type { DispatchNotificationDependencies } from './dispatch-notification';
import {
	dispatchNotification,
	dispatchNotificationTest,
} from './dispatch-notification';

const pushItem = {
	type: NotificationChannel.AppPushNotification,
	title: 'Breaking news',
	body: 'Lead summary',
	link: 'https://www.theguardian.com/world/2026/jul/22/lead',
} as const;

const newsletterItem = {
	type: NotificationChannel.Newsletter,
	title: 'Lead story',
	body: 'Lead summary',
	link: 'https://www.theguardian.com/world/2026/jul/22/lead',
} as const;

const baseRequest = {
	idempotencyKey: 'dispatch-test',
	sender: 'dispatch-test',
	options: { dryRun: false, scheduledFor: null },
} as const;

const notificationId = 'notif-2f1c9a7e';

const ssmParameters: Record<string, string> = {
	BRAZE_API_KEY: 'test-api-key',
	BRAZE_REST_ENDPOINT: 'https://rest.example.braze.eu',
	BRAZE_APP_ID: 'test-app-id',
	BRAZE_TEST_EMAIL_FROM: 'dev testing <dev-testing@email.theguardian.com>',
	BRAZE_TEST_EMAIL_REPLY_TO: 'NO_REPLY_TO',
	EMAIL_RENDERING_ENDPOINT: 'https://email-rendering.example.com',
	MOBILE_N10N_ENDPOINT: 'https://n10n.example.com',
	MOBILE_N10N_API_KEY: 'test-n10n-key',
};

const createDependencies = () => {
	const getSSMParameter = mock((key: string) =>
		Promise.resolve(ssmParameters[key] ?? ''),
	);
	const sendAppNotification = mock(() => Promise.resolve({ id: 'n10n-id' }));
	const renderEmail = mock(() =>
		Promise.resolve('<html>Rendered newsletter</html>'),
	);
	const sendBrazeCampaign = mock(() =>
		Promise.resolve({ message: 'success', dispatch_id: 'dispatch-123' }),
	);
	const registerBrazeTestEmailRecipients = mock(() => Promise.resolve());
	const sendBrazeTestEmail = mock(() =>
		Promise.resolve({ message: 'success', dispatch_id: 'test-dispatch-123' }),
	);
	const dependencies: DispatchNotificationDependencies = {
		getSSMParameter,
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
		registerBrazeTestEmailRecipients,
		sendBrazeTestEmail,
	};

	return {
		dependencies,
		getSSMParameter,
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
		registerBrazeTestEmailRecipients,
		sendBrazeTestEmail,
	};
};

describe('dispatchNotification', () => {
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
			id: expect.any(String),
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
		expect(outcomes).toEqual([
			{
				notificationId,
				id: expect.any(String),
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
				id: expect.any(String),
				importance: 'Major',
				topics: [{ type: 'breaking', name: 'uk' }],
			}),
		);
		expect(sendAppNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				id: expect.any(String),
				importance: 'Minor',
				topics: [{ type: 'newsstand', name: 'newsstandIos' }],
			}),
		);
		expect(outcomes).toEqual([
			{
				notificationId,
				id: expect.any(String),
				topicType: 'breaking-news',
				status: 'success',
			},
			{
				notificationId,
				id: expect.any(String),
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
		expect(outcomes).toEqual([
			{
				notificationId,
				id: expect.any(String),
				topicType: 'breaking-news',
				status: 'success',
			},
			{
				notificationId,
				id: expect.any(String),
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
				id: expect.any(String),
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
			id: expect.any(String),
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

	it('renders each newsletter segment and sends it through Braze', async () => {
		const { dependencies, renderEmail, sendBrazeCampaign } =
			createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: newsletterItem } },
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: {
						type: 'segment',
						items: ['UK', 'US'],
					},
					compose: { items: ['lead'], subject: 'Daily briefing' },
				},
			},
		};

		await dispatchNotification(request, notificationId, dependencies);
		expect(renderEmail).toHaveBeenNthCalledWith(1, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.UK.emailRenderingNewsletterId,
			headlineOverride: newsletterItem.title,
			previewText: newsletterItem.body,
			timeoutMs: 10_000,
		});
		expect(renderEmail).toHaveBeenNthCalledWith(2, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.US.emailRenderingNewsletterId,
			headlineOverride: newsletterItem.title,
			previewText: newsletterItem.body,
			timeoutMs: 10_000,
		});
		expect(sendBrazeCampaign).toHaveBeenNthCalledWith(1, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			campaignId: newsletterSegments.UK.brazeCampaignId,
			html: '<html>Rendered newsletter</html>',
			subject: 'Daily briefing',
			timeoutMs: 10_000,
		});
		expect(sendBrazeCampaign).toHaveBeenNthCalledWith(2, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			campaignId: newsletterSegments.US.brazeCampaignId,
			html: '<html>Rendered newsletter</html>',
			subject: 'Daily briefing',
			timeoutMs: 10_000,
		});
	});

	it('dispatches every channel in a combined request', async () => {
		const {
			dependencies,
			renderEmail,
			sendAppNotification,
			sendBrazeCampaign,
		} = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { push: pushItem, newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'push' },
				},
				[NotificationChannel.Newsletter]: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['newsletter'], subject: 'Daily briefing' },
				},
			},
		};

		await dispatchNotification(request, notificationId, dependencies);
		expect(renderEmail).toHaveBeenCalledTimes(1);
		expect(sendBrazeCampaign).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
	});

	it('attempts both channels when one fails', async () => {
		const { dependencies, renderEmail, sendAppNotification } =
			createDependencies();
		renderEmail.mockRejectedValue(new Error('Rendering failed'));
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { push: pushItem, newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'push' },
				},
				[NotificationChannel.Newsletter]: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['newsletter'], subject: 'Daily briefing' },
				},
			},
		};

		let dispatchError: unknown;
		try {
			await dispatchNotification(request, notificationId, dependencies);
		} catch (error) {
			dispatchError = error;
		}

		expect(dispatchError).toEqual(new Error('Rendering failed'));
		expect(renderEmail).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledTimes(1);
	});

	it('renders and sends test newsletters directly to normalized recipients', async () => {
		const {
			dependencies,
			renderEmail,
			sendBrazeCampaign,
			registerBrazeTestEmailRecipients,
			sendBrazeTestEmail,
		} = createDependencies();
		const request: NotificationTestSendRequest = {
			idempotencyKey: 'test-dispatch',
			sender: 'dispatch-test',
			options: { dryRun: false },
			content: { items: { newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: {
						type: 'email',
						items: ['Test.User@guardian.co.uk'],
					},
					variants: ['UK', 'US'],
					compose: { items: ['newsletter'], subject: 'Test briefing' },
				},
			},
		};

		await dispatchNotificationTest(request, dependencies);

		expect(renderEmail).toHaveBeenNthCalledWith(1, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.UK.emailRenderingNewsletterId,
			headlineOverride: newsletterItem.title,
			previewText: newsletterItem.body,
			timeoutMs: 10_000,
		});
		expect(renderEmail).toHaveBeenNthCalledWith(2, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.US.emailRenderingNewsletterId,
			headlineOverride: newsletterItem.title,
			previewText: newsletterItem.body,
			timeoutMs: 10_000,
		});
		expect(registerBrazeTestEmailRecipients).toHaveBeenCalledWith({
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			recipientEmails: ['test.user@guardian.co.uk'],
			timeoutMs: 10_000,
		});
		expect(sendBrazeTestEmail).toHaveBeenCalledTimes(2);
		expect(sendBrazeTestEmail).toHaveBeenCalledWith({
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			appId: 'test-app-id',
			from: 'dev testing <dev-testing@email.theguardian.com>',
			replyTo: 'NO_REPLY_TO',
			recipientEmails: ['test.user@guardian.co.uk'],
			html: '<html>Rendered newsletter</html>',
			subject: 'Test briefing',
			timeoutMs: 10_000,
		});
		expect(sendBrazeCampaign).not.toHaveBeenCalled();
	});

	it('renders a test dry run without registering or sending recipients', async () => {
		const {
			dependencies,
			renderEmail,
			registerBrazeTestEmailRecipients,
			sendBrazeTestEmail,
		} = createDependencies();
		const request: NotificationTestSendRequest = {
			idempotencyKey: 'test-dry-run',
			sender: 'dispatch-test',
			options: { dryRun: true },
			content: { items: { newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: {
						type: 'email',
						items: ['test.user@guardian.co.uk'],
					},
					variants: ['UK', 'US'],
					compose: { items: ['newsletter'], subject: 'Test briefing' },
				},
			},
		};

		await dispatchNotificationTest(request, dependencies);

		expect(renderEmail).toHaveBeenCalledTimes(2);
		expect(registerBrazeTestEmailRecipients).not.toHaveBeenCalled();
		expect(sendBrazeTestEmail).not.toHaveBeenCalled();
	});

	it('does not call downstream clients for a dry run', async () => {
		const {
			dependencies,
			renderEmail,
			sendAppNotification,
			sendBrazeCampaign,
		} = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			options: { dryRun: true, scheduledFor: null },
			content: { items: { lead: pushItem } },
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
		expect(renderEmail).not.toHaveBeenCalled();
		expect(sendBrazeCampaign).not.toHaveBeenCalled();
		expect(sendAppNotification).not.toHaveBeenCalled();
	});
});
