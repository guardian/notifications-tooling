import { getSSMParameter } from '@config/ssm';
import { type BrazeClient, createBrazeClient } from '@services';
import { z } from 'zod';

const brazeEnvironmentSchema = z.object({
	BRAZE_API_KEY: z.string().trim().min(1),
	BRAZE_REST_ENDPOINT: z.url(),
});

type LoadSsmParameter = typeof getSSMParameter;
type CreateBrazeServiceClient = typeof createBrazeClient;

export type LoadBrazeClient = () => Promise<BrazeClient>;

export const createLoadBrazeClient = (
	loadSsmParameter: LoadSsmParameter = getSSMParameter,
	buildBrazeClient: CreateBrazeServiceClient = createBrazeClient,
): LoadBrazeClient => {
	let clientPromise: Promise<BrazeClient> | undefined;

	return async () => {
		clientPromise ??= (async () => {
			const [apiKey, restEndpoint] = await Promise.all([
				loadSsmParameter('BRAZE_API_KEY'),
				loadSsmParameter('BRAZE_REST_ENDPOINT'),
			]);

			const environment = brazeEnvironmentSchema.parse({
				BRAZE_API_KEY: apiKey,
				BRAZE_REST_ENDPOINT: restEndpoint,
			});

			return buildBrazeClient({
				apiKey: environment.BRAZE_API_KEY,
				restEndpoint: environment.BRAZE_REST_ENDPOINT,
			});
		})().catch((error) => {
			clientPromise = undefined;
			throw error;
		});

		return clientPromise;
	};
};

export const loadBrazeClient = createLoadBrazeClient();
