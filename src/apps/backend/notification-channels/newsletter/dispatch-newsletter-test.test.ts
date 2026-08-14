import { describe, expect, it } from 'bun:test';
import { newsletterSegments, NotificationChannel } from '@config';
import type { NotificationTestSendRequest } from '../../routers/notifications/schemas/notification-send-request';
import { createDependencies, newsletterItem, testId } from '../test-support';
import { dispatchNewsletterTest } from './dispatch-newsletter-test';

describe('dispatchNewsletterTest', () => {
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

		const { outcomes } = await dispatchNewsletterTest(
			request,
			testId,
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
		expect(outcomes).toEqual([
			{
				testId,
				variant: 'UK',
				dispatchId: 'test-dispatch-123',
				status: 'success',
			},
			{
				testId,
				variant: 'US',
				dispatchId: 'test-dispatch-123',
				status: 'success',
			},
		]);
	});

	it('renders, registers and sends even when dryRun is set (gated by the orchestrator)', async () => {
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

		await dispatchNewsletterTest(request, testId, dependencies);

		expect(renderEmail).toHaveBeenCalledTimes(2);
		expect(registerBrazeTestEmailRecipients).toHaveBeenCalledTimes(1);
		expect(sendBrazeTestEmail).toHaveBeenCalledTimes(2);
	});
});
