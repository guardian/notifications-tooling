import type { Result } from '../api-client/client';
import { safeFetchJsonAndParse } from '../api-client/client';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from '../schemas';
import { sendNotificationResponseSchema } from '../schemas';

export const sendNotification = async (
	sendNotificationRequest: SendNotificationRequest,
): Promise<Result<SendNotificationResponse>> => {
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');

	return safeFetchJsonAndParse(
		sendNotificationResponseSchema,
		'/v1/notifications',
		{
			method: 'POST',
			headers,
			body: JSON.stringify(sendNotificationRequest),
			credentials: 'include',
		},
	);
};
