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

type RegisterBrazeTestEmailRecipientsRequest = Pick<
	SendBrazeTestEmailRequest,
	'apiKey' | 'restEndpoint' | 'timeoutMs' | 'recipientEmails'
>;

type FindBrazePushRecipientRequest = {
	apiKey: string;
	restEndpoint: string;
	timeoutMs: number;
	recipientEmail: string;
};

type SendBrazeTestPushRequest = {
	apiKey: string;
	restEndpoint: string;
	timeoutMs: number;
	externalUserIds: string[];
	notificationId: string;
	title: string;
	body: string;
	link: string;
	appleDeepLink: string;
	imageUrl?: string;
};

export type BrazeCampaignTriggerResponse = {
	dispatch_id?: string;
	message: string;
};

export type BrazeOperation =
	| 'campaign trigger'
	| 'test user tracking'
	| 'test email send'
	| 'test push recipient lookup'
	| 'test push send';

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

export class BrazePushRecipientNotFoundError extends Error {
	constructor(readonly recipientEmail: string) {
		super(`No push-capable Braze profile was found for '${recipientEmail}'.`);
		this.name = 'BrazePushRecipientNotFoundError';
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

const brazeUserExportResponseSchema = z.object({
	message: z.literal('success'),
	users: z.array(
		z.object({
			external_id: z.string().optional(),
			push_tokens: z.array(z.object({ token: z.string() })).optional(),
			apps: z
				.array(
					z.object({
						last_used: z.iso.datetime().nullable().optional(),
					}),
				)
				.optional(),
		}),
	),
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

	return parseBrazeResponse(
		response,
		brazeCampaignTriggerResponseSchema,
		'campaign trigger',
	);
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
}: SendBrazeTestEmailRequest): Promise<BrazeCampaignTriggerResponse> => {
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

	return parseBrazeResponse(
		messageResponse,
		brazeCampaignTriggerResponseSchema,
		'test email send',
	);
};

export const findBrazePushRecipient = async ({
	apiKey,
	restEndpoint,
	timeoutMs,
	recipientEmail,
}: FindBrazePushRecipientRequest): Promise<string | undefined> => {
	const response = await requestBraze(
		new URL('/users/export/ids', restEndpoint).toString(),
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email_address: recipientEmail,
				fields_to_export: ['external_id', 'push_tokens', 'apps'],
			}),
			signal: AbortSignal.timeout(timeoutMs),
		},
		'test push recipient lookup',
	);

	const { users } = await parseBrazeResponse(
		response,
		brazeUserExportResponseSchema,
		'test push recipient lookup',
	);
	const candidates = users.filter(
		(user) => user.external_id && user.push_tokens?.length,
	);

	const mostRecent = candidates.sort((left, right) => {
		const latestUse = (apps: typeof left.apps): number =>
			Math.max(
				...(apps ?? []).map(({ last_used }) =>
					last_used ? Date.parse(last_used) : Number.NEGATIVE_INFINITY,
				),
			);
		return latestUse(right.apps) - latestUse(left.apps);
	})[0];

	return mostRecent?.external_id;
};

export const sendBrazeTestPush = async ({
	apiKey,
	restEndpoint,
	timeoutMs,
	externalUserIds,
	notificationId,
	title,
	body,
	link,
	appleDeepLink,
	imageUrl,
}: SendBrazeTestPushRequest): Promise<BrazeCampaignTriggerResponse> => {
	const response = await requestBraze(
		new URL('/messages/send', restEndpoint).toString(),
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				external_user_ids: externalUserIds,
				recipient_subscription_state: 'all',
				messages: {
					apple_push: {
						alert: { title, body },
						custom_uri: appleDeepLink,
						use_webview: false,
						mutable_content: true,
						extra: {
							uniqueIdentifier: notificationId,
							notificationType: 'news',
							uri: link,
							...(imageUrl ? { imageUrl } : {}),
						},
					},
					android_push: {
						title,
						alert: body,
						custom_uri: link,
						use_webview: false,
						...(imageUrl
							? { extra: { appboy_image_url: imageUrl } }
							: {}),
					},
				},
			}),
			signal: AbortSignal.timeout(timeoutMs),
		},
		'test push send',
	);

	return parseBrazeResponse(
		response,
		brazeCampaignTriggerResponseSchema,
		'test push send',
	);
};
