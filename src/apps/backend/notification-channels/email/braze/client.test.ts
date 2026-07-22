import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test';
import {
	MAX_BRAZE_TRIGGER_PROPERTIES_BYTES,
	sendBrazeCampaign,
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
};

describe('sendBrazeCampaign', () => {
	it('triggers a Braze campaign with rendered email content', () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ message: 'success', dispatch_id: 'dispatch-123' }),
		);

		expect(sendBrazeCampaign(request)).resolves.toEqual({
			message: 'success',
			dispatch_id: 'dispatch-123',
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
			},
		);
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
});
