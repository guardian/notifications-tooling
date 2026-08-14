import { describe, expect, it } from 'bun:test';
import { newsletterSegments, NotificationChannel } from '@config';
import type { NotificationSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import { dispatchNotification } from '../dispatch-notification';
import {
	baseRequest,
	createDependencies,
	newsletterItem,
	notificationId,
} from '../test-support';

describe('dispatchNotification (newsletter channel)', () => {
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

		const outcomes = await dispatchNotification(
			request,
			notificationId,
			dependencies,
		);
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
		expect(outcomes.newsletter).toEqual([
			{
				notificationId,
				segmentId: 'UK',
				campaignId: newsletterSegments.UK.brazeCampaignId,
				dispatchId: 'dispatch-123',
				status: 'success',
			},
			{
				notificationId,
				segmentId: 'US',
				campaignId: newsletterSegments.US.brazeCampaignId,
				dispatchId: 'dispatch-123',
				status: 'success',
			},
		]);
	});
});
