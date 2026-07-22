import { describe, expect, it, mock } from 'bun:test';
import { createBrazeClient, type FetchImplementation } from './client';

const request = {
	broadcast: true,
	campaign_id: 'campaign-uk',
	trigger_properties: {
		body: '<html>News</html>',
		subject: 'Breaking news',
	},
} as const;

describe('createBrazeClient', () => {
	it('triggers a Braze campaign with bearer authentication', () => {
		const fetchImplementation = mock<FetchImplementation>(() =>
			Promise.resolve(
				Response.json({ message: 'success', dispatch_id: 'dispatch-123' }),
			),
		);
		const client = createBrazeClient({
			apiKey: 'secret-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			fetchImplementation,
		});

		expect(client.triggerCampaign(request)).resolves.toEqual({
			message: 'success',
			dispatch_id: 'dispatch-123',
		});
		expect(fetchImplementation).toHaveBeenCalledWith(
			'https://rest.example.braze.eu/campaigns/trigger/send',
			{
				method: 'POST',
				headers: {
					Authorization: 'Bearer secret-api-key',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(request),
			},
		);
	});

	it('throws a safe error when Braze rejects the request', () => {
		const fetchImplementation = mock<FetchImplementation>(() =>
			Promise.resolve(
				new Response('sensitive provider response', { status: 401 }),
			),
		);
		const client = createBrazeClient({
			apiKey: 'secret-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
			fetchImplementation,
		});

		expect(client.triggerCampaign(request)).rejects.toThrow(
			'Braze campaign trigger failed with status 401.',
		);
	});
});
