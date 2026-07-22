import { z } from 'zod';
import {
	createMockAppNotificationClient,
	type MockAppNotificationClient,
} from './app-notification/client';
import { type BrazeClient, createBrazeClient } from './email/braze/client';
import type { NotificationChannelConfig } from './generate-requests';
import type { NotificationChannelClients } from './invoke-requests';

const notificationChannelEnvironmentSchema = z.object({
	BRAZE_API_KEY: z.string().trim().min(1),
	BRAZE_REST_ENDPOINT: z.url(),
	BRAZE_CAMPAIGN_ID_UK: z.string().trim().min(1),
	BRAZE_CAMPAIGN_ID_US: z.string().trim().min(1),
	BRAZE_CAMPAIGN_ID_AU: z.string().trim().min(1),
});

export type NotificationChannelRuntime = {
	generatorConfig: NotificationChannelConfig;
	clients: NotificationChannelClients;
};

type RuntimeDependencies = {
	createBrazeClient?: typeof createBrazeClient;
	createAppNotificationClient?: () => MockAppNotificationClient;
};

export const createNotificationChannelRuntime = (
	environment: NodeJS.ProcessEnv = process.env,
	{
		createBrazeClient: createBrazeClientDependency = createBrazeClient,
		createAppNotificationClient = createMockAppNotificationClient,
	}: RuntimeDependencies = {},
): NotificationChannelRuntime => {
	const parsedEnvironment =
		notificationChannelEnvironmentSchema.parse(environment);

	const braze: BrazeClient = createBrazeClientDependency({
		apiKey: parsedEnvironment.BRAZE_API_KEY,
		restEndpoint: parsedEnvironment.BRAZE_REST_ENDPOINT,
	});

	return {
		generatorConfig: {
			brazeCampaignIds: {
				UK: parsedEnvironment.BRAZE_CAMPAIGN_ID_UK,
				US: parsedEnvironment.BRAZE_CAMPAIGN_ID_US,
				AU: parsedEnvironment.BRAZE_CAMPAIGN_ID_AU,
			},
		},
		clients: {
			braze,
			appNotification: createAppNotificationClient(),
		},
	};
};
