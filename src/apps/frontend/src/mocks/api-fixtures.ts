import { ApiError } from '../api/errors';
import type { SendNotificationResponse } from '../features/stand-frontend/api/schemas';

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
	status: 'accepted',
	notificationId: 'email-1234-abcd',
	plans: [
		{
			channel: 'newsletter',
			planId: 'plan9',
			status: 'accepted',
		},
	],
	statusUrl: 'example.com/status/email-1234-abcd',
	cancellable: {
		cancelUrl: 'example.com/cancel/email-1234-abcd',
		expiresAt: 0,
	},
};
