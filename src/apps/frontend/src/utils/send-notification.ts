import type { Result } from '../api-client/client';
import { safeFetchJsonAndParse } from '../api-client/client';
import type { ApiError } from '../api-client/errors';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from '../schemas';
import { sendNotificationResponseSchema } from '../schemas';

export type NotificationDispatchFailure = {
	failure: 'dispatch-fail';
	notification: SendNotificationResponse;
};

export type SendNotificationFailure = ApiError | NotificationDispatchFailure;

export type SendNotificationResult =
	| {
			success: true;
			data: SendNotificationResponse;
	  }
	| {
			success: false;
			failure: SendNotificationFailure;
	  };

export const sendNotification = async (
	sendNotificationRequest: SendNotificationRequest,
): Promise<SendNotificationResult> => {
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');

	const result: Result<SendNotificationResponse> = await safeFetchJsonAndParse(
		sendNotificationResponseSchema,
		'/v1/notifications',
		{
			method: 'POST',
			headers,
			body: JSON.stringify(sendNotificationRequest),
			credentials: 'include',
			acceptedResponseStatuses: [502],
		},
	);

	if (
		result.success &&
		(result.data.status === 'failed' ||
			result.data.status === 'partially_delivered')
	) {
		return {
			success: false,
			failure: {
				failure: 'dispatch-fail',
				notification: result.data,
			},
		};
	}

	return result;
};
