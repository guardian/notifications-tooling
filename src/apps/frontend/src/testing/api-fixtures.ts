import { ApiError } from '../api-client/errors';
import type { NotificationSummary, SendNotificationResponse } from '../schemas';

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

export const deliveredNewsletterEmailSendResponse: SendNotificationResponse = {
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
	...deliveredNewsletterEmailSendResponse,
	id: 'push-failed-1234',
	idempotencyKey: 'push-failed-idempotency-key',
	status: 'failed',
	dispatches: [
		{
			...deliveredNewsletterEmailSendResponse.dispatches[0]!,
			id: 'push-dispatch-uk',
			channel: 'app-push',
			requested: {
				channel: 'app-push',
				topicType: 'breaking-news',
				editions: ['international'],
			},
			resolved: {
				channel: 'app-push',
				topics: [{ type: 'breaking', name: 'international' }],
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

export const failedNewsletterSendResponse: SendNotificationResponse = {
	...deliveredNewsletterEmailSendResponse,
	id: 'email-failed-1234',
	idempotencyKey: 'email-failed-idempotency-key',
	status: 'failed',
	dispatches: [
		{
			...deliveredNewsletterEmailSendResponse.dispatches[0]!,
			status: 'failure',
			providerRef: null,
			failureReason: 'http_error',
			providerStatusCode: 500,
		},
	],
};

export const partiallyDeliveredNewsletterSendResponse: SendNotificationResponse =
	{
		...failedNewsletterSendResponse,
		id: 'email-partial-1234',
		status: 'partially_delivered',
		dispatches: [
			{
				...deliveredNewsletterEmailSendResponse.dispatches[0]!,
			},
			{
				...failedNewsletterSendResponse.dispatches[0]!,
				id: 'dispatch-us-failed',
				requested: { channel: 'newsletter', segment: 'US' },
				resolved: {
					channel: 'newsletter',
					brazeCampaignId: 'braze-campaign-2',
					emailRenderingId: 'briefing-us',
				},
			},
		],
	};

export const partiallyDeliveredAppPushSendResponse: SendNotificationResponse = {
	...failedAppPushSendResponse,
	id: 'push-partial-1234',
	status: 'partially_delivered',
	dispatches: [
		{
			...failedAppPushSendResponse.dispatches[0]!,
			id: 'push-dispatch-uk',
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

export const appPushSendBeyondBradford: NotificationSummary = {
	id: 'e5108867-a956-415a-adb6-fd4c2f73ae55',
	idempotencyKey: '1fc587dc-f4f2-4202-998f-f2c753674cc4',
	kind: 'send',
	status: 'delivered',
	sender: 'dispatch-app',
	createdByEmail: 'ann.nonymous@guardian.co.uk',
	dryRun: false,
	scheduledFor: null,
	content: {
		items: {
			'lead-story': {
				body: 'Beyond Bradford and the Brontës – new walking trail shows West Yorkshire’s natural beauty',
				link: 'https://www.theguardian.com/travel/2026/sep/17/bradford-pennine-gateway-walking-trail-west-yorkshire',
				type: 'app-push',
				media: {
					type: 'image',
					imageUrl:
						'https://media.guim.co.uk/47d94c17d58abd74d461b0eb2be411aa2fe4ee04/208_0_4860_3888/500.jpg',
					thumbnailUrl:
						'https://media.guim.co.uk/47d94c17d58abd74d461b0eb2be411aa2fe4ee04/208_0_4860_3888/500.jpg',
				},
				title: 'Sports news',
			},
		},
	},
	channels: {
		'app-push': {
			compose: {
				use: 'lead-story',
			},
			audience: {
				type: 'topic',
				items: [
					{
						name: 'us',
						type: 'sport',
					},
					{
						name: 'international',
						type: 'sport',
					},
					{
						name: 'europe',
						type: 'sport',
					},
				],
			},
		},
	},
	failedTargets: {
		topics: [],
		segments: [],
	},
	createdAt: '2026-09-21T08:41:43.779Z',
	updatedAt: '2026-09-21T08:41:44.369Z',
};

export const newsletterSendBeyondBradford: NotificationSummary = {
	id: '965856e4-bd60-414b-a41c-b1d78a32a972',
	idempotencyKey: '6f458574-9144-48fa-aa2e-17473dceda8d',
	kind: 'send',
	status: 'delivered',
	sender: 'dispatch-app',
	createdByEmail: 'john.doe@guardian.co.uk',
	dryRun: false,
	scheduledFor: null,
	content: {
		items: {
			'lead-story': {
				body: '',
				link: 'https://www.theguardian.com/travel/2026/sep/17/bradford-pennine-gateway-walking-trail-west-yorkshire',
				type: 'newsletter',
				media: {
					type: 'image',
					imageUrl:
						'https://media.guim.co.uk/47d94c17d58abd74d461b0eb2be411aa2fe4ee04/208_0_4860_3888/500.jpg',
					thumbnailUrl:
						'https://media.guim.co.uk/47d94c17d58abd74d461b0eb2be411aa2fe4ee04/208_0_4860_3888/500.jpg',
				},
				title:
					'Beyond Bradford and the Brontës – new walking trail shows West Yorkshire’s natural beauty',
			},
		},
	},
	channels: {
		newsletter: {
			compose: {
				items: ['lead-story'],
				subject:
					'Exclusive: Beyond Bradford and the Brontës – new walking trail shows West Yorkshire’s natural beauty',
			},
			audience: {
				type: 'segment',
				items: ['UK'],
			},
		},
	},
	failedTargets: {
		topics: [],
		segments: [],
	},
	createdAt: '2026-09-18T10:23:37.594Z',
	updatedAt: '2026-09-18T10:23:38.578Z',
};
