import { fetchJsonAndParse } from '../../../api/client';
import type { ApiError } from '../../../api/errors';
import type { SendingResult } from '../types';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from './schemas';
import { sendNotificationResponseSchema } from './schemas';

export const sendNotification = async (
	sendNotificationRequest: SendNotificationRequest,
): Promise<SendingResult> => {
	const headers = new Headers();
	headers.append('Content-Type', 'application/json');

	try {
		const confirmation: SendNotificationResponse = await fetchJsonAndParse(
			sendNotificationResponseSchema,
			'/v1/notifications',
			{
				method: 'POST',
				headers,
				body: JSON.stringify(sendNotificationRequest),
				credentials: 'include',
			},
		);
		return {
			ok: true,
			response: confirmation,
		};
	} catch (err: unknown) {
		const apiError = err as ApiError; // fetchJsonAndParse only throws ApiError

		if (apiError.failure === 'fetch-fail') {
			return {
				ok: false,
				requestFailed: true,
				response: undefined,
			};
		}

		if (
			apiError.failure === 'json-parse-fail' ||
			apiError.failure === 'schema-parse-fail'
		) {
			// TO DO - this indicate the response was ok (IE message sent?)
			// but the JSON payload could not be parsed.
			// This should be treated as an application failure, not a send failure
		}

		return {
			ok: false,
			response: apiError,
		};
	}
};
