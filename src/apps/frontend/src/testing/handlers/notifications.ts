import { http, HttpResponse } from 'msw';
import { getApiBaseUrl } from '../../api-client/config';

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
