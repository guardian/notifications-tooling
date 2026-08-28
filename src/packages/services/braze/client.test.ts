import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import {
	getBrazeCampaignDetails,
	MAX_BRAZE_TRIGGER_PROPERTIES_BYTES,
	registerBrazeTestEmailRecipients,
	sendBrazeCampaign,
	sendBrazeTestEmail,
} from './client';

afterEach(() => {
	mock.restore();
});

const request = {
	apiKey: 'secret-api-key',
	restEndpoint: 'https://rest.example.braze.eu',
	campaignId: 'campaign-uk',
	html: '<html>News</html>',
	subject: 'Breaking news',
	timeoutMs: 10_000,
};

describe('sendBrazeCampaign', () => {
	it('triggers a Braze campaign with rendered email content', () => {
		const timeoutSignal = new AbortController().signal;
		const timeout = spyOn(AbortSignal, 'timeout').mockReturnValue(
			timeoutSignal,
		);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json(
				{ message: 'success', dispatch_id: 'dispatch-123' },
				{ status: 201 },
			),
		);

		expect(sendBrazeCampaign(request)).resolves.toEqual({
			message: 'success',
			dispatch_id: 'dispatch-123',
			status: 201,
		});
		expect(fetcher).toHaveBeenCalledWith(
			'https://rest.example.braze.eu/campaigns/trigger/send',
			{
				method: 'POST',
				headers: {
					Authorization: 'Bearer secret-api-key',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					broadcast: true,
					campaign_id: 'campaign-uk',
					trigger_properties: {
						body: '<html>News</html>',
						subject: 'Breaking news',
					},
				}),
				signal: timeoutSignal,
			},
		);
		expect(timeout).toHaveBeenCalledWith(10_000);
	});

	it('preserves Unicode content', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ message: 'success' }),
		);

		await sendBrazeCampaign({
			...request,
			html: '<p>Résumé of today’s news</p>',
			subject: 'Today’s briefing',
		});

		expect(fetcher.mock.calls[0]?.[1]?.body).toBe(
			JSON.stringify({
				broadcast: true,
				campaign_id: 'campaign-uk',
				trigger_properties: {
					body: '<p>Résumé of today’s news</p>',
					subject: 'Today’s briefing',
				},
			}),
		);
	});

	it('rejects trigger properties over the Braze size limit', () => {
		expect(
			sendBrazeCampaign({
				...request,
				html: 'a'.repeat(MAX_BRAZE_TRIGGER_PROPERTIES_BYTES),
			}),
		).rejects.toThrow('Braze trigger properties exceed the 50000-byte limit');
	});

	it('throws a safe error when Braze rejects the request', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('sensitive provider response', { status: 401 }),
		);

		expect(sendBrazeCampaign(request)).rejects.toThrow(
			'Braze campaign trigger failed with status 401.',
		);
	});

	it('classifies Braze timeouts', async () => {
		const timeoutError = new Error('request timed out');
		timeoutError.name = 'TimeoutError';
		spyOn(globalThis, 'fetch').mockRejectedValue(timeoutError);

		try {
			await sendBrazeCampaign(request);
			expect.unreachable();
		} catch (error) {
			expect(error).toMatchObject({
				name: 'BrazeApiError',
				operation: 'campaign trigger',
				reason: 'timeout',
			});
		}
	});

	it('classifies malformed Braze responses', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ message: 123 }),
		);

		try {
			await sendBrazeCampaign(request);
			expect.unreachable();
		} catch (error) {
			expect(error).toMatchObject({
				name: 'BrazeApiError',
				operation: 'campaign trigger',
				reason: 'invalid_response',
			});
		}
	});

	it('rejects a non-success Braze response', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ message: 'queued' }),
		);

		try {
			await sendBrazeCampaign(request);
			expect.unreachable();
		} catch (error) {
			expect(error).toMatchObject({
				name: 'BrazeApiError',
				operation: 'campaign trigger',
				reason: 'invalid_response',
			});
		}
	});
});

describe('registerBrazeTestEmailRecipients', () => {
	it('creates stable test profiles', () => {
		const timeoutSignal = new AbortController().signal;
		spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ message: 'success' }),
		);

		expect(
			registerBrazeTestEmailRecipients({
				apiKey: 'secret-api-key',
				restEndpoint: 'https://rest.example.braze.eu',
				timeoutMs: 10_000,
				recipientEmails: [
					'first.user@guardian.co.uk',
					'second.user@guardian.co.uk',
				],
			}),
		).resolves.toBeUndefined();

		expect(fetcher).toHaveBeenCalledWith(
			'https://rest.example.braze.eu/users/track',
			{
				method: 'POST',
				headers: {
					Authorization: 'Bearer secret-api-key',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					attributes: [
						{
							_update_existing_only: false,
							user_alias: {
								alias_name: 'first.user@guardian.co.uk',
								alias_label: 'dispatch-tool-test-email',
							},
							email: 'first.user@guardian.co.uk',
						},
						{
							_update_existing_only: false,
							user_alias: {
								alias_name: 'second.user@guardian.co.uk',
								alias_label: 'dispatch-tool-test-email',
							},
							email: 'second.user@guardian.co.uk',
						},
					],
				}),
				signal: timeoutSignal,
			},
		);
	});

	it('rejects a partial test-profile update', () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ message: 'success', errors: [{ type: 'invalid' }] }),
		);

		expect(
			registerBrazeTestEmailRecipients({
				apiKey: 'secret-api-key',
				restEndpoint: 'https://rest.example.braze.eu',
				timeoutMs: 10_000,
				recipientEmails: ['first.user@guardian.co.uk'],
			}),
		).rejects.toThrow('Braze test user tracking was not fully successful.');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('throws a safe error when Braze rejects test-profile tracking', () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('sensitive provider response', { status: 401 }),
		);

		expect(
			registerBrazeTestEmailRecipients({
				apiKey: 'secret-api-key',
				restEndpoint: 'https://rest.example.braze.eu',
				timeoutMs: 10_000,
				recipientEmails: ['first.user@guardian.co.uk'],
			}),
		).rejects.toThrow('Braze test user tracking failed with status 401.');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
});

describe('sendBrazeTestEmail', () => {
	it('sends rendered content to stable test aliases', () => {
		const timeoutSignal = new AbortController().signal;
		spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json(
				{ message: 'success', dispatch_id: 'dispatch-456' },
				{ status: 201 },
			),
		);

		expect(
			sendBrazeTestEmail({
				apiKey: 'secret-api-key',
				restEndpoint: 'https://rest.example.braze.eu',
				appId: 'email-app-id',
				from: 'The Guardian <newsletters@theguardian.com>',
				replyTo: 'newsletters@theguardian.com',
				html: '<html>Test news</html>',
				subject: 'Test breaking news',
				timeoutMs: 10_000,
				recipientEmails: [
					'first.user@guardian.co.uk',
					'second.user@guardian.co.uk',
				],
			}),
		).resolves.toEqual({
			message: 'success',
			dispatch_id: 'dispatch-456',
			status: 201,
		});
		expect(fetcher).toHaveBeenCalledWith(
			'https://rest.example.braze.eu/messages/send',
			{
				method: 'POST',
				headers: {
					Authorization: 'Bearer secret-api-key',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_aliases: [
						{
							alias_name: 'first.user@guardian.co.uk',
							alias_label: 'dispatch-tool-test-email',
						},
						{
							alias_name: 'second.user@guardian.co.uk',
							alias_label: 'dispatch-tool-test-email',
						},
					],
					recipient_subscription_state: 'all',
					messages: {
						email: {
							app_id: 'email-app-id',
							from: 'The Guardian <newsletters@theguardian.com>',
							reply_to: 'newsletters@theguardian.com',
							subject: 'Test breaking news',
							body: '<html>Test news</html>',
						},
					},
				}),
				signal: timeoutSignal,
			},
		);
	});

	it('throws a safe error when Braze rejects the test email', () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('sensitive provider response', { status: 400 }),
		);

		expect(
			sendBrazeTestEmail({
				apiKey: 'secret-api-key',
				restEndpoint: 'https://rest.example.braze.eu',
				appId: 'email-app-id',
				from: 'The Guardian <newsletters@theguardian.com>',
				replyTo: 'newsletters@theguardian.com',
				html: '<html>Test news</html>',
				subject: 'Test breaking news',
				timeoutMs: 10_000,
				recipientEmails: ['first.user@guardian.co.uk'],
			}),
		).rejects.toThrow('Braze test email send failed with status 400.');
		expect(fetcher).toHaveBeenCalledTimes(1);
	});
});

describe('getBrazeCampaignDetails', () => {
	const campaignRequest = {
		apiKey: 'secret-api-key',
		restEndpoint: 'https://rest.example.braze.eu',
		campaignId: 'campaign-uk',
		timeoutMs: 10_000,
	};

	const campaignDetails = {
		name: 'Breaking news UK',
		created_at: '2026-08-01T12:00:00Z',
		updated_at: '2026-08-02T12:00:00Z',
		description: 'UK breaking news',
		archived: false,
		enabled: true,
		draft: false,
		schedule_type: 'triggered',
		channels: ['email'],
		first_sent: '2026-08-01T12:00:00Z',
		last_sent: '2026-08-02T12:00:00Z',
	};

	it('returns campaign details and the Braze response status', () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json(campaignDetails, { status: 200 }),
		);

		expect(getBrazeCampaignDetails(campaignRequest)).resolves.toEqual({
			data: campaignDetails,
			status: 200,
		});
		expect(fetcher).toHaveBeenCalledWith(
			'https://rest.example.braze.eu/campaigns/details?campaign_id=campaign-uk',
			expect.objectContaining({ method: 'GET' }),
		);
	});

	it('returns the provider error when Braze responds with status 500', () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('service unavailable', { status: 500 }),
		);

		expect(getBrazeCampaignDetails(campaignRequest)).resolves.toEqual({
			data: undefined,
			status: 500,
			errorMessage: 'Braze get campaign details failed with status 500.',
		});
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('returns a parsing error when Braze responds with the wrong format', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ name: 'Incomplete campaign' }, { status: 200 }),
		);

		expect(getBrazeCampaignDetails(campaignRequest)).resolves.toEqual({
			data: undefined,
			status: 200,
			errorMessage: 'Braze get campaign details returned an invalid response.',
		});
	});
});
