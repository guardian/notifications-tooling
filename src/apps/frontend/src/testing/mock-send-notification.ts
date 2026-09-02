import type { Result } from '../api/client';
import type { ApiError } from '../api/errors';
import type { SendNotificationResponse } from '../features/stand-frontend/api/schemas';
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
