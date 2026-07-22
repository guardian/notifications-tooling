import { describe, expect, it, mock } from 'bun:test';
import type { BrazeClient } from './email/braze/client';
import { createNotificationChannelRuntime } from './runtime';

const environment = {
	BRAZE_API_KEY: 'test-api-key',
	BRAZE_REST_ENDPOINT: 'https://rest.example.braze.eu',
	BRAZE_CAMPAIGN_ID_UK: 'campaign-uk',
	BRAZE_CAMPAIGN_ID_US: 'campaign-us',
	BRAZE_CAMPAIGN_ID_AU: 'campaign-au',
};

describe('createNotificationChannelRuntime', () => {
	it('constructs channel configuration and clients from the environment', () => {
		const brazeClient: BrazeClient = {
			triggerCampaign: () => Promise.resolve({ message: 'success' }),
		};
		const createBrazeClient = mock(() => brazeClient);
		const appNotificationClient = {
			send: () => Promise.resolve({ status: 'mocked' as const }),
		};

		const runtime = createNotificationChannelRuntime(environment, {
			createBrazeClient,
			createAppNotificationClient: () => appNotificationClient,
		});

		expect(createBrazeClient).toHaveBeenCalledWith({
			apiKey: 'test-api-key',
			restEndpoint: 'https://rest.example.braze.eu',
		});
		expect(runtime).toEqual({
			generatorConfig: {
				brazeCampaignIds: {
					UK: 'campaign-uk',
					US: 'campaign-us',
					AU: 'campaign-au',
				},
			},
			clients: {
				braze: brazeClient,
				appNotification: appNotificationClient,
			},
		});
	});

	it('rejects missing provider configuration', () => {
		expect(() =>
			createNotificationChannelRuntime({
				...environment,
				BRAZE_API_KEY: '',
			}),
		).toThrow();
	});
});
