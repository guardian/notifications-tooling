import { z } from 'zod';

export const MAX_BRAZE_TRIGGER_PROPERTIES_BYTES = 50_000;

type SendBrazeCampaignRequest = {
	apiKey: string;
	restEndpoint: string;
	campaignId: string;
	html: string;
	subject: string;
	timeoutMs: number;
};

type SendBrazeTestEmailRequest = {
	apiKey: string;
	restEndpoint: string;
	appId: string;
	from: string;
	replyTo: string;
	html: string;
	subject: string;
	timeoutMs: number;
	recipientEmails: string[];
};

export type BrazeCampaignTriggerResponse = {
	dispatch_id?: string;
	message: string;
};

const brazeCampaignTriggerResponseSchema = z.object({
	dispatch_id: z.string().optional(),
	message: z.string(),
});

const brazeUserTrackResponseSchema = z.object({
	message: z.string(),
	errors: z.array(z.unknown()).optional(),
});

const testEmailUserAliasLabel = 'dispatch-tool-test-email';

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
	timeoutMs,
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
		signal: AbortSignal.timeout(timeoutMs),
	});

	if (!response.ok) {
		throw new Error(
			`Braze campaign trigger failed with status ${response.status}.`,
		);
	}

	return brazeCampaignTriggerResponseSchema.parse(await response.json());
};

export const sendBrazeTestEmail = async ({
	apiKey,
	restEndpoint,
	appId,
	from,
	replyTo,
	html,
	subject,
	timeoutMs,
	recipientEmails,
}: SendBrazeTestEmailRequest): Promise<BrazeCampaignTriggerResponse> => {
	const userAliases = recipientEmails.map((email) => ({
		alias_name: email,
		alias_label: testEmailUserAliasLabel,
	}));
	const headers = {
		Authorization: `Bearer ${apiKey}`,
		'Content-Type': 'application/json',
	};
	const userTrackResponse = await fetch(
		new URL('/users/track', restEndpoint).toString(),
		{
			method: 'POST',
			headers,
			body: JSON.stringify({
				attributes: recipientEmails.map((email, index) => ({
					_update_existing_only: false,
					user_alias: userAliases[index],
					email,
				})),
			}),
			signal: AbortSignal.timeout(timeoutMs),
		},
	);

	if (!userTrackResponse.ok) {
		throw new Error(
			`Braze test user tracking failed with status ${userTrackResponse.status}.`,
		);
	}

	const userTrackResult = brazeUserTrackResponseSchema.parse(
		await userTrackResponse.json(),
	);
	if (userTrackResult.message !== 'success' || userTrackResult.errors?.length) {
		throw new Error('Braze test user tracking was not fully successful.');
	}

	const messageResponse = await fetch(
		new URL('/messages/send', restEndpoint).toString(),
		{
			method: 'POST',
			headers,
			body: JSON.stringify({
				user_aliases: userAliases,
				recipient_subscription_state: 'all',
				messages: {
					email: {
						app_id: appId,
						from,
						reply_to: replyTo,
						subject,
						body: html,
					},
				},
			}),
			signal: AbortSignal.timeout(timeoutMs),
		},
	);

	if (!messageResponse.ok) {
		throw new Error(
			`Braze test email send failed with status ${messageResponse.status}.`,
		);
	}

	return brazeCampaignTriggerResponseSchema.parse(await messageResponse.json());
};
