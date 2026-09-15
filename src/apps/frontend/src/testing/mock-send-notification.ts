import type { ApiError } from '../api-client/errors';
import type { SendNotificationResult } from '../utils/send-notification';
import { deliveredNewsletterEmailSendResponse } from './api-fixtures';

export const mockSendNotification = () => {
	return new Promise<SendNotificationResult>((resolve) => {
		setTimeout(() => {
			resolve({
				success: true,
				data: deliveredNewsletterEmailSendResponse,
			});
		}, 500);
	});
};

export const mockSendRejectedNotification = (apiError: ApiError) => () => {
	return new Promise<SendNotificationResult>((resolve) => {
		setTimeout(() => {
			resolve({
				success: false,
				failure: apiError,
			});
		}, 500);
	});
};
