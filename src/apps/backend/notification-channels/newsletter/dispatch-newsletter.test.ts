import { describe, expect, it } from 'bun:test';
import { newsletterSegments, NotificationChannel } from '@config';
import { BrazeApiError } from '@services';
import type { NotificationSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import { dispatchNotification } from '../dispatch-notification';
import {
	baseRequest,
	createDependencies,
	newsletterItem,
	notificationId,
} from '../test-support';
import {
	dispatchNewsletter,
	resolveNewsletterDispatch,
} from './dispatch-newsletter';

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

	it('records the Braze HTTP status on a failed segment while still sending the others', async () => {
		const { dependencies, sendBrazeCampaign } = createDependencies();
		const brazeError = new BrazeApiError('campaign trigger', 'http_error', 502);
		let call = 0;
		sendBrazeCampaign.mockImplementation(() => {
			call += 1;
			return call === 1
				? Promise.resolve({ message: 'success', dispatch_id: 'dispatch-123' })
				: Promise.reject(brazeError);
		});
		const request: NotificationSendRequest = {
			...baseRequest,
			content: { items: { lead: newsletterItem } },
			channels: {
				[NotificationChannel.Newsletter]: {
					audience: { type: 'segment', items: ['UK', 'US'] },
					compose: { items: ['lead'], subject: 'Daily briefing' },
				},
			},
		};

		const { outcomes, error } = await dispatchNewsletter(
			resolveNewsletterDispatch(request),
			notificationId,
			dependencies,
		);

		// Both segments are attempted even though the second one failed.
		expect(sendBrazeCampaign).toHaveBeenCalledTimes(2);
		expect(outcomes).toEqual([
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
				status: 'failure',
				failureReason: 'http_error',
				providerStatusCode: 502,
			},
		]);
		expect(error).toBe(brazeError);
	});
});
