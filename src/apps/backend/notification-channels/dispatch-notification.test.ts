import { NotificationChannel } from '@config';
import { describe, expect, it, mock } from 'bun:test';
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
	category: 'editorial',
	priority: 'standard',
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
	const dependencies: DispatchNotificationDependencies = {
		environment: {
			BRAZE_API_KEY: 'test-api-key',
			BRAZE_REST_ENDPOINT: 'https://rest.example.braze.eu',
			EMAIL_RENDERING_ENDPOINT: 'https://email-rendering.example.com',
		},
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
	};

	return {
		dependencies,
		renderEmail,
		sendAppNotification,
		sendBrazeCampaign,
	};
};

describe('dispatchNotification', () => {
	it('resolves push segments and calls the mocked app-notification client', () => {
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

		expect(
			dispatchNotification(request, dependencies),
		).resolves.toBeUndefined();
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

	it('renders each newsletter segment and sends it through Braze', () => {
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

		expect(
			dispatchNotification(request, dependencies),
		).resolves.toBeUndefined();
		expect(renderEmail).toHaveBeenNthCalledWith(1, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: 'UK',
		});
		expect(renderEmail).toHaveBeenNthCalledWith(2, {
			endpoint: 'https://email-rendering.example.com',
			articleUrl: newsletterItem.link,
			newsletterId: 'US',
		});
		expect(sendBrazeCampaign).toHaveBeenNthCalledWith(1, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			campaignId: 'uk_campaign_id',
			html: '<html>Rendered newsletter</html>',
			subject: 'Daily briefing',
		});
		expect(sendBrazeCampaign).toHaveBeenNthCalledWith(2, {
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			campaignId: 'us_campaign_id',
			html: '<html>Rendered newsletter</html>',
			subject: 'Daily briefing',
		});
	});

	it('does not call downstream clients for a dry run', () => {
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
					audience: { type: 'segment', items: ['breaking-news-uk'] },
					compose: { use: 'lead' },
				},
			},
		};

		expect(
			dispatchNotification(request, dependencies),
		).resolves.toBeUndefined();
		expect(renderEmail).not.toHaveBeenCalled();
		expect(sendBrazeCampaign).not.toHaveBeenCalled();
		expect(sendAppNotification).not.toHaveBeenCalled();
	});
});
