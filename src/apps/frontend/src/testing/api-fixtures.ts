import { ApiError } from '../api-client/errors';
import type { SendNotificationResponse } from '../schemas';

export const badRequestError = new ApiError({
	status: 400,
	failure: 'non-2xx-response',
	message: 'The request body is malformed.',
	requestId: '1234-abcd',
	details: [
		{
			code: 'too_big',
			path: '/content/items/lead/title',
			message: 'string',
		},
	],
});

export const unauthenticatedError = new ApiError({
	status: 401,
	failure: 'unauthenticated',
	message: 'Authentication is required to access this resource.',
	loginUrl: 'https://login.gutools.co.uk/login',
});

export const noPermissionError = new ApiError({
	status: 403,
	failure: 'forbidden',
	message: 'You do not have permission to access this resource.',
	requestId: '1234-abcd',
});

export const internalError = new ApiError({
	status: 502,
	failure: 'non-2xx-response',
	message: 'Email rendering is currently unavailable.',
	requestId: '1234-abcd',
});

export const jsonParseFailure = new ApiError({
	status: 202,
	failure: 'json-parse-fail',
	message: 'Response from /api/v1/notifications was not valid JSON',
	requestId: '1234-abcd',
	cause: new Error('some parse error'),
});

export const fetchFailError = new ApiError({
	status: undefined,
	failure: 'fetch-fail',
	message: 'Network request to /api/v1/notifications failed',
});

export const acceptedEmailSendResponse: SendNotificationResponse = {
	id: 'email-1234-abcd',
	idempotencyKey: 'email-1234-abcd',
	kind: 'send',
	status: 'delivered',
	sender: 'notifications-tooling-spa/v1',
	createdByEmail: 'ada.lovelace@guardian.co.uk',
	dryRun: false,
	scheduledFor: null,
	content: {},
	channels: {},
	createdAt: '2026-08-25T00:00:00.000Z',
	updatedAt: '2026-08-25T00:00:00.000Z',
	dispatches: [
		{
			id: 'dispatch-1234-abcd',
			channel: 'newsletter',
			requested: { channel: 'newsletter', segment: 'UK' },
			resolved: {
				channel: 'newsletter',
				brazeCampaignId: 'braze-campaign-1',
				emailRenderingId: 'briefing-uk',
			},
			status: 'success',
			providerRef: 'braze-dispatch-1',
			failureReason: null,
			providerStatusCode: null,
			createdAt: '2026-08-25T00:00:00.000Z',
			updatedAt: '2026-08-25T00:00:00.000Z',
		},
	],
};

export const failedAppPushSendResponse: SendNotificationResponse = {
	...acceptedEmailSendResponse,
	id: 'push-failed-1234',
	idempotencyKey: 'push-failed-idempotency-key',
	status: 'failed',
	dispatches: [
		{
			...acceptedEmailSendResponse.dispatches[0]!,
			id: 'push-dispatch-uk',
			channel: 'app-push',
			requested: {
				channel: 'app-push',
				topicType: 'breaking-news',
				editions: ['uk'],
			},
			resolved: {
				channel: 'app-push',
				topics: [{ type: 'breaking', name: 'uk' }],
				importance: 'Major',
			},
			status: 'failure',
			providerRef: null,
			failureReason: 'http_error',
			providerStatusCode: 500,
		},
	],
};

export const unconfirmedAppPushSendResponse: SendNotificationResponse = {
	...failedAppPushSendResponse,
	id: 'push-unconfirmed-1234',
	dispatches: [],
};

export const partiallyDeliveredAppPushSendResponse: SendNotificationResponse = {
	...failedAppPushSendResponse,
	id: 'push-partial-1234',
	status: 'partially_delivered',
	dispatches: [
		{
			...failedAppPushSendResponse.dispatches[0]!,
			id: 'push-dispatch-uk',
			status: 'success',
			failureReason: null,
			providerStatusCode: 201,
		},
		{
			...failedAppPushSendResponse.dispatches[0]!,
			id: 'push-dispatch-us',
			requested: {
				channel: 'app-push',
				topicType: 'breaking-news',
				editions: ['us'],
			},
			resolved: {
				channel: 'app-push',
				topics: [{ type: 'breaking', name: 'us' }],
				importance: 'Major',
			},
		},
	],
};
