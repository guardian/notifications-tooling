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

type GetBrazeCampaignDetailsRequest = {
	apiKey: string;
	restEndpoint: string;
	campaignId: string;
	timeoutMs: number;
};

type RegisterBrazeTestEmailRecipientsRequest = Pick<
	SendBrazeTestEmailRequest,
	'apiKey' | 'restEndpoint' | 'timeoutMs' | 'recipientEmails'
>;

export type BrazeCampaignTriggerResponse = {
	dispatch_id?: string;
	message: string;
};

/** A successful campaign trigger response plus the Braze HTTP status. */
export type BrazeCampaignTriggerResult = BrazeCampaignTriggerResponse & {
	status: number;
};

export type BrazeOperation =
	| 'campaign trigger'
	| 'test user tracking'
	| 'test email send'
	| 'get campaign details';

export type BrazeFailureReason =
	| 'http_error'
	| 'timeout'
	| 'network_error'
	| 'invalid_response'
	| 'partial_failure';

export class BrazeApiError extends Error {
	constructor(
		readonly operation: BrazeOperation,
		readonly reason: BrazeFailureReason,
		readonly status?: number,
		options?: ErrorOptions,
	) {
		const message = (() => {
			switch (reason) {
				case 'http_error':
					return status === undefined
						? `Braze ${operation} failed.`
						: `Braze ${operation} failed with status ${status}.`;
				case 'timeout':
					return `Braze ${operation} timed out.`;
				case 'network_error':
					return `Braze ${operation} failed.`;
				case 'invalid_response':
					return `Braze ${operation} returned an invalid response.`;
				case 'partial_failure':
					return `Braze ${operation} was not fully successful.`;
			}
		})();

		super(message, options);
		this.name = 'BrazeApiError';
	}
}

const brazeCampaignTriggerResponseSchema = z.object({
	dispatch_id: z.string().optional(),
	message: z.literal('success'),
});

const brazeUserTrackResponseSchema = z.object({
	message: z.string(),
	errors: z.array(z.unknown()).optional(),
});

// see https://www.braze.com/docs/api/endpoints/export/campaigns/get_campaign_details#request-parameters
// this is not the full set of properties returned, just the ones likely to be relevant
const brazeCampaignDetailsSchema = z.object({
	name: z.string(),
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
	description: z.string().optional(),
	archived: z.boolean(),
	enabled: z.boolean(),
	draft: z.boolean(),
	schedule_type: z.string(),
	channels: z.string().array().optional(),
	first_sent: z.string().optional(),
	last_sent: z.string().optional(),
});

const testEmailUserAliasLabel = 'dispatch-tool-test-email';

const isTimeoutError = (error: unknown): boolean =>
	error instanceof Error &&
	(error.name === 'AbortError' || error.name === 'TimeoutError');

const requestBraze = async (
	url: string,
	init: RequestInit,
	operation: BrazeOperation,
): Promise<Response> => {
	let response: Response;
	try {
		response = await fetch(url, init);
	} catch (error) {
		throw new BrazeApiError(
			operation,
			isTimeoutError(error) ? 'timeout' : 'network_error',
			undefined,
			{ cause: error },
		);
	}

	if (!response.ok) {
		console.log(response);
		const data: unknown = await response.json();
		console.log('FROM BRAZE', data);
		throw new BrazeApiError(operation, 'http_error', response.status);
	}

	return response;
};

const parseBrazeResponse = async <Schema extends z.ZodType>(
	response: Response,
	schema: Schema,
	operation: BrazeOperation,
): Promise<z.output<Schema>> => {
	try {
		return schema.parse(await response.json());
	} catch (error) {
		throw new BrazeApiError(operation, 'invalid_response', response.status, {
			cause: error,
		});
	}
};

const createTestEmailUserAlias = (email: string) => ({
	alias_name: email,
	alias_label: testEmailUserAliasLabel,
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
	timeoutMs,
}: SendBrazeCampaignRequest): Promise<BrazeCampaignTriggerResult> => {
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

	const response = await requestBraze(
		campaignTriggerUrl,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(request),
			signal: AbortSignal.timeout(timeoutMs),
		},
		'campaign trigger',
	);

	const result = await parseBrazeResponse(
		response,
		brazeCampaignTriggerResponseSchema,
		'campaign trigger',
	);
	return { ...result, status: response.status };
};

export const registerBrazeTestEmailRecipients = async ({
	apiKey,
	restEndpoint,
	timeoutMs,
	recipientEmails,
}: RegisterBrazeTestEmailRecipientsRequest): Promise<void> => {
	const userTrackResponse = await requestBraze(
		new URL('/users/track', restEndpoint).toString(),
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				attributes: recipientEmails.map((email) => ({
					_update_existing_only: false,
					user_alias: createTestEmailUserAlias(email),
					email,
				})),
			}),
			signal: AbortSignal.timeout(timeoutMs),
		},
		'test user tracking',
	);

	const userTrackResult = await parseBrazeResponse(
		userTrackResponse,
		brazeUserTrackResponseSchema,
		'test user tracking',
	);
	if (userTrackResult.message !== 'success' || userTrackResult.errors?.length) {
		throw new BrazeApiError('test user tracking', 'partial_failure');
	}
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
}: SendBrazeTestEmailRequest): Promise<BrazeCampaignTriggerResult> => {
	const messageResponse = await requestBraze(
		new URL('/messages/send', restEndpoint).toString(),
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_aliases: recipientEmails.map(createTestEmailUserAlias),
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
		'test email send',
	);

	const result = await parseBrazeResponse(
		messageResponse,
		brazeCampaignTriggerResponseSchema,
		'test email send',
	);
	return { ...result, status: messageResponse.status };
};

export const getBrazeCampaignDetails = async ({
	campaignId,
	restEndpoint,
	apiKey,
	timeoutMs,
}: GetBrazeCampaignDetailsRequest) => {
	const messageResponse = await requestBraze(
		new URL(
			`/campaigns/details?campaign_id=${campaignId}`,
			restEndpoint,
		).toString(),
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			signal: AbortSignal.timeout(timeoutMs),
		},
		'get campaign details',
	);

	const result = await parseBrazeResponse(
		messageResponse,
		brazeCampaignDetailsSchema,
		'test email send',
	);

	return { data: result, status: messageResponse.status };
};
