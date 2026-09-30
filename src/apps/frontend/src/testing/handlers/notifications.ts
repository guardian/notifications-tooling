import { http, HttpResponse } from 'msw';
import { getApiBaseUrl } from '../../api-client/config';
import type { NotificationListResponse } from '../../schemas';

export const notificationSenders = [
	'alex@example.com',
	'jamie@example.com',
	'sam@example.com',
	'taylor@example.com',
	'very.long.editorial.sender.address@guardian.co.uk',
];

export const notificationSendersHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications/senders`,
	() => HttpResponse.json({ senders: notificationSenders }),
);

export const notificationHistoryHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	({ request }) => {
		const url = new URL(request.url);
		const response: NotificationListResponse = {
			total: 0,
			limit: Number(url.searchParams.get('limit') ?? 5),
			offset: Number(url.searchParams.get('offset') ?? 0),
			notifications: [],
		};
		return HttpResponse.json(response);
	},
);
