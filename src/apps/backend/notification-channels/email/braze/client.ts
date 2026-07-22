import { z } from 'zod';

export const MAX_BRAZE_TRIGGER_PROPERTIES_BYTES = 50_000;

type SendBrazeCampaignRequest = {
	apiKey: string;
	restEndpoint: string;
	campaignId: string;
	html: string;
	subject: string;
};

export type BrazeCampaignTriggerResponse = {
	dispatch_id?: string;
	message: string;
};

const brazeCampaignTriggerResponseSchema = z.object({
	dispatch_id: z.string().optional(),
	message: z.string(),
});

type BrazeCampaignTriggerRequest = {
	broadcast: true;
	campaign_id: string;
	trigger_properties: {
		body: string;
		subject: string;
	};
};

export const sendBrazeCampaign = async ({
	apiKey,
	restEndpoint,
	campaignId,
	html,
	subject,
}: SendBrazeCampaignRequest): Promise<BrazeCampaignTriggerResponse> => {
	const triggerProperties = { body: html, subject };
	const triggerPropertiesSize = Buffer.byteLength(
		JSON.stringify(triggerProperties),
		'utf8',
	);
	if (triggerPropertiesSize > MAX_BRAZE_TRIGGER_PROPERTIES_BYTES) {
		throw new RangeError(
			`Braze trigger properties exceed the ${MAX_BRAZE_TRIGGER_PROPERTIES_BYTES}-byte limit (received ${triggerPropertiesSize} bytes).`,
		);
	}

	const request: BrazeCampaignTriggerRequest = {
		broadcast: true,
		campaign_id: campaignId,
		trigger_properties: triggerProperties,
	};
	const campaignTriggerUrl = new URL(
		'/campaigns/trigger/send',
		restEndpoint,
	).toString();

	const response = await fetch(campaignTriggerUrl, {
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
};
