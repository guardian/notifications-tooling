import { http, HttpResponse } from 'msw';
import { getApiBaseUrl } from '../../api/config';
import {
	sendNotificationRequestSchema,
	type SendNotificationResponse,
} from '../../features/stand-frontend/api/schemas';

const notificationId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

export const sendNotificationSuccessHandler = http.post(
	`${getApiBaseUrl()}/v1/notifications`,
	async ({ request }) => {
		sendNotificationRequestSchema.parse(await request.json());
		const response: SendNotificationResponse = {
			notificationId,
			status: 'accepted',
			plans: [
				{
					channel: 'newsletter',
					planId: `${notificationId}#newsletter`,
					status: 'accepted',
				},
			],
			statusUrl: `/v1/notifications/${notificationId}/status`,
			cancellable: {
				cancelUrl: `/v1/notifications/${notificationId}/cancel`,
				expiresAt: 1_753_200_000,
			},
		};
		return HttpResponse.json(response, { status: 202 });
	},
);

/** A general non-2xx failure, for exercising `ApiError`'s error UX. */
export const sendNotificationFailureHandler = http.post(
	`${getApiBaseUrl()}/v1/notifications`,
	() => HttpResponse.json({ error: 'internal_error' }, { status: 500 }),
);

export const notificationHandlers = [sendNotificationSuccessHandler];
