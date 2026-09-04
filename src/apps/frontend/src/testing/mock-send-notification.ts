import type { Result } from '../api-client/client';
import type { ApiError } from '../api-client/errors';
import type { SendNotificationResponse } from '../schemas';
import { acceptedEmailSendResponse } from './api-fixtures';

export const mockSendNotification = () => {
	return new Promise<Result<SendNotificationResponse>>((resolve) => {
		setTimeout(() => {
			resolve({
				success: true,
				data: acceptedEmailSendResponse,
			});
		}, 500);
	});
};

export const mockSendRejectedNotification = (apiError: ApiError) => () => {
	return new Promise<Result<SendNotificationResponse>>((resolve) => {
		setTimeout(() => {
			resolve({
				success: false,
				failure: apiError,
			});
		}, 500);
	});
};
