import { z } from 'zod';
import type { BrazeCampaignTriggerRequest } from './generate-request';

export type BrazeClientConfig = {
	apiKey: string;
	restEndpoint: string;
};

export type BrazeCampaignTriggerResponse = {
	dispatch_id?: string;
	message: string;
};

const brazeCampaignTriggerResponseSchema = z.object({
	dispatch_id: z.string().optional(),
	message: z.string(),
});

export type BrazeClient = {
	triggerCampaign: (
		request: BrazeCampaignTriggerRequest,
	) => Promise<BrazeCampaignTriggerResponse>;
};

export type FetchImplementation = (
	input: string | URL | Request,
	init?: RequestInit,
) => Promise<Response>;

type CreateBrazeClientOptions = BrazeClientConfig & {
	fetchImplementation?: FetchImplementation;
};

export const createBrazeClient = ({
	apiKey,
	restEndpoint,
	fetchImplementation = fetch,
}: CreateBrazeClientOptions): BrazeClient => {
	const campaignTriggerUrl = new URL(
		'/campaigns/trigger/send',
		restEndpoint,
	).toString();

	return {
		triggerCampaign: async (request) => {
			const response = await fetchImplementation(campaignTriggerUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(request),
			});

			if (!response.ok) {
				throw new Error(
					`Braze campaign trigger failed with status ${response.status}.`,
				);
			}

			return brazeCampaignTriggerResponseSchema.parse(await response.json());
		},
	};
};
