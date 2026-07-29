import { describe, expect, it, mock } from 'bun:test';
import { newsletterSegments, NotificationChannel } from '@config';
import type { NotificationSendRequest } from '../routers/notifications/schemas/notification-send-request';
import type { DispatchNotificationDependencies } from './dispatch-notification';
import { dispatchNotification } from './dispatch-notification';

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

const createDependencies = () => {
	const sendAppNotification = mock(() => Promise.resolve());
	const renderEmail = mock(() =>
		Promise.resolve('<html>Rendered newsletter</html>'),
	);
	const sendBrazeCampaign = mock(() =>
		Promise.resolve({ message: 'success', dispatch_id: 'dispatch-123' }),
	);
	const registerBrazeTestEmailRecipients = mock(() => Promise.resolve());
	const sendBrazeTestEmail = mock(() =>
		Promise.resolve({ message: 'success', dispatch_id: 'dispatch-456' }),
	);
	const dependencies: DispatchNotificationDependencies = {
		environment: {
			BRAZE_API_KEY: 'test-api-key',
			BRAZE_REST_ENDPOINT: 'https://rest.example.braze.eu',
			BRAZE_APP_ID: 'test-app-id',
			BRAZE_TEST_EMAIL_FROM: 'The Guardian <newsletters@theguardian.com>',
			BRAZE_TEST_EMAIL_REPLY_TO: 'newsletters@theguardian.com',
			EMAIL_RENDERING_ENDPOINT: 'https://email-rendering.example.com',
		},
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
		registerBrazeTestEmailRecipients,
		sendBrazeTestEmail,
	};

	return {
		dependencies,
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
		registerBrazeTestEmailRecipients,
		sendBrazeTestEmail,
	};
};

describe('dispatchNotification', () => {
	it('resolves push segments and calls the mocked app-notification client', async () => {
		const { dependencies, sendAppNotification } = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: {
						type: 'segment',
						items: ['breaking-news-uk', 'newsstand-ios'],
					},
					compose: { use: 'lead' },
				},
			},
		};

		await dispatchNotification(request, dependencies);
		expect(sendAppNotification).toHaveBeenCalledWith({
			topics: [
				{ type: 'breaking', name: 'uk' },
				{ type: 'newsstand', name: 'newsstandIos' },
			],
			title: pushItem.title,
			body: pushItem.body,
			link: pushItem.link,
		});
	});

	it('renders each newsletter segment and sends it through Braze', async () => {
		const { dependencies, renderEmail, sendBrazeCampaign } =
			createDependencies();
		renderEmail
			.mockResolvedValueOnce('<html>UK rendered newsletter</html>')
			.mockResolvedValueOnce('<html>US rendered newsletter</html>');
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

		await dispatchNotification(request, dependencies);
		expect(renderEmail).toHaveBeenNthCalledWith(1, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.UK.emailRenderingNewsletterId,
			timeoutMs: 10_000,
		});
		expect(renderEmail).toHaveBeenNthCalledWith(2, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.US.emailRenderingNewsletterId,
			timeoutMs: 10_000,
		});
		expect(sendBrazeCampaign).toHaveBeenNthCalledWith(1, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			campaignId: newsletterSegments.UK.brazeCampaignId,
			html: '<html>UK rendered newsletter</html>',
			subject: 'Daily briefing',
			timeoutMs: 10_000,
		});
		expect(sendBrazeCampaign).toHaveBeenNthCalledWith(2, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			campaignId: newsletterSegments.US.brazeCampaignId,
			html: '<html>US rendered newsletter</html>',
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
					audience: { type: 'segment', items: ['breaking-news-uk'] },
					compose: { use: 'push' },
				},
				[NotificationChannel.Newsletter]: {
					audience: { type: 'segment', items: ['UK'] },
					compose: { items: ['newsletter'], subject: 'Daily briefing' },
				},
			},
		};

		await dispatchNotification(request, dependencies);
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
					audience: { type: 'segment', items: ['breaking-news-uk'] },
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
			await dispatchNotification(request, dependencies);
		} catch (error) {
			dispatchError = error;
		}

		expect(dispatchError).toEqual(new Error('Rendering failed'));
		expect(renderEmail).toHaveBeenCalledTimes(1);
		expect(sendAppNotification).toHaveBeenCalledWith({
			topics: [{ type: 'breaking', name: 'uk' }],
			title: pushItem.title,
			body: pushItem.body,
			link: pushItem.link,
		});
	});

	it('sends each selected rendering directly to the test email recipients', async () => {
		const {
			dependencies,
			registerBrazeTestEmailRecipients,
			renderEmail,
			sendBrazeCampaign,
			sendBrazeTestEmail,
		} = createDependencies();
		renderEmail
			.mockResolvedValueOnce('<html>UK rendered newsletter</html>')
			.mockResolvedValueOnce('<html>US rendered newsletter</html>');
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: {
						type: 'email',
						items: ['first.user@guardian.co.uk', 'second.user@guardian.co.uk'],
						segments: ['UK', 'US'],
					},
					compose: { items: ['newsletter'], subject: 'Test briefing' },
				},
			},
		};

		await dispatchNotification(request, dependencies);

		expect(renderEmail).toHaveBeenCalledTimes(2);
		expect(renderEmail).toHaveBeenNthCalledWith(1, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.UK.emailRenderingNewsletterId,
			timeoutMs: 10_000,
		});
		expect(renderEmail).toHaveBeenNthCalledWith(2, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: newsletterSegments.US.emailRenderingNewsletterId,
			timeoutMs: 10_000,
		});
		expect(sendBrazeCampaign).not.toHaveBeenCalled();
		expect(registerBrazeTestEmailRecipients).toHaveBeenCalledTimes(1);
		expect(registerBrazeTestEmailRecipients).toHaveBeenCalledWith({
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			timeoutMs: 10_000,
			recipientEmails: [
				'first.user@guardian.co.uk',
				'second.user@guardian.co.uk',
			],
		});
		expect(sendBrazeTestEmail).toHaveBeenCalledTimes(2);
		expect(sendBrazeTestEmail).toHaveBeenNthCalledWith(1, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			appId: 'test-app-id',
			from: 'The Guardian <newsletters@theguardian.com>',
			replyTo: 'newsletters@theguardian.com',
			html: '<html>UK rendered newsletter</html>',
			subject: 'Test briefing',
			timeoutMs: 10_000,
			recipientEmails: [
				'first.user@guardian.co.uk',
				'second.user@guardian.co.uk',
			],
		});
		expect(sendBrazeTestEmail).toHaveBeenNthCalledWith(2, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			appId: 'test-app-id',
			from: 'The Guardian <newsletters@theguardian.com>',
			replyTo: 'newsletters@theguardian.com',
			html: '<html>US rendered newsletter</html>',
			subject: 'Test briefing',
			timeoutMs: 10_000,
			recipientEmails: [
				'first.user@guardian.co.uk',
				'second.user@guardian.co.uk',
			],
		});
	});

	it('uses the configured Braze dev sender defaults for test emails', async () => {
		const { dependencies, sendBrazeTestEmail } = createDependencies();
		dependencies.environment.BRAZE_TEST_EMAIL_FROM = '';
		dependencies.environment.BRAZE_TEST_EMAIL_REPLY_TO = '  ';
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { newsletter: newsletterItem } },
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: {
						type: 'email',
						items: ['test.user@guardian.co.uk'],
						segments: ['UK'],
					},
					compose: { items: ['newsletter'], subject: 'Test briefing' },
				},
			},
		};

		await dispatchNotification(request, dependencies);

		expect(sendBrazeTestEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				from: 'dev testing <dev-testing@email.theguardian.com>',
				replyTo: 'no-reply@editorial.theguardian.com',
			}),
		);
	});

	it('does not call downstream clients for a dry run', async () => {
		const {
			dependencies,
			registerBrazeTestEmailRecipients,
			renderEmail,
			sendAppNotification,
			sendBrazeCampaign,
			sendBrazeTestEmail,
		} = createDependencies();
		const request: NotificationSendRequest = {
			...baseRequest,
			options: { dryRun: true, scheduledFor: null },
			content: { items: { lead: pushItem } },
			channels: {
				[NotificationChannel.AppPushNotification]: {
					audience: { type: 'segment', items: ['breaking-news-uk'] },
					compose: { use: 'lead' },
				},
			},
		};

		await dispatchNotification(request, dependencies);
		expect(renderEmail).not.toHaveBeenCalled();
		expect(sendBrazeCampaign).not.toHaveBeenCalled();
		expect(registerBrazeTestEmailRecipients).not.toHaveBeenCalled();
		expect(sendBrazeTestEmail).not.toHaveBeenCalled();
		expect(sendAppNotification).not.toHaveBeenCalled();
	});
});
