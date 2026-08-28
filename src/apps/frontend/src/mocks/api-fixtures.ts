import { ApiError } from '../api/errors';
import type { SendNotificationResponse } from '../features/stand-frontend/api/schemas';
import type { HistoryAlert } from '../features/stand-frontend/components/HistoryTab';
import { articleFixture } from './capi-fixtures';

const historyThumbnailUrl = articleFixture.fields?.thumbnail;
const minutesAgo = (minutes: number) =>
	new Date(Date.now() - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours: number) =>
	new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const notificationHistoryResponse = {
	alerts: [
		{
			id: '2df4fb5d-6a52-46e8-a88e-81e4f990d642',
			title: 'Prime minister announces cabinet reshuffle',
			href: '#2df4fb5d-6a52-46e8-a88e-81e4f990d642',
			thumbnailUrl: historyThumbnailUrl,
			channel: 'push',
			alertType: 'Breaking news',
			sentFrom: 'US',
			sentBy: 'alex@example.com',
			sentTo: ['US', 'AU'],
			sentAt: minutesAgo(5),
			status: 'Sent',
		},
		{
			id: '71b8a520-d0a5-463c-8799-930b00a0f3ed',
			title: 'The Guardian Today: your morning briefing',
			href: '#71b8a520-d0a5-463c-8799-930b00a0f3ed',
			thumbnailUrl: historyThumbnailUrl,
			channel: 'email',
			alertType: 'Breaking news',
			sentFrom: 'US',
			sentBy: 'sam@example.com',
			sentTo: ['US'],
			sentAt: minutesAgo(6),
			status: 'Sent',
		},
		{
			id: 'cbca4dac-45a6-4eba-93ef-ed0975ac9c8d',
			title: 'Breaking: major rail disruption across south-east England',
			href: '#cbca4dac-45a6-4eba-93ef-ed0975ac9c8d',
			channel: 'push',
			alertType: 'Editors’ picks',
			sentFrom: 'UK',
			sentBy: 'jamie@example.com',
			sentTo: ['US', 'UK', 'AU', 'INT', 'EU'],
			sentAt: hoursAgo(5),
			status: 'Failed',
		},
		{
			id: '922934ad-7cc3-4463-b184-bfe0bd0c877c',
			title: 'First Edition: Wednesday’s top stories',
			href: '#922934ad-7cc3-4463-b184-bfe0bd0c877c',
			thumbnailUrl: historyThumbnailUrl,
			channel: 'email',
			alertType: 'One not to miss',
			sentFrom: 'UK',
			sentBy: 'taylor@example.com',
			sentTo: ['US', 'UK'],
			sentAt: '2026-08-11T15:34:00Z',
			status: 'Sent',
		},
		{
			id: '2ea23787-4e6c-4db3-8018-fb7416887476',
			title: 'Matildas secure place in Asian Cup final',
			href: '#2ea23787-4e6c-4db3-8018-fb7416887476',
			thumbnailUrl: historyThumbnailUrl,
			channel: 'push',
			alertType: 'Sport',
			sentFrom: 'UK',
			sentBy: 'morgan@example.com',
			sentTo: ['AU', 'INT'],
			sentAt: '2026-08-10T17:32:00Z',
			status: 'Sent',
		},
	] satisfies HistoryAlert[],
};

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
			target: 'UK',
			status: 'success',
			providerRef: 'braze-dispatch-1',
			failureReason: null,
			providerStatusCode: null,
			detail: null,
			createdAt: '2026-08-25T00:00:00.000Z',
			updatedAt: '2026-08-25T00:00:00.000Z',
		},
	],
};
