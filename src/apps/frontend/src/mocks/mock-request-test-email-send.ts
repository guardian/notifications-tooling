import type { ApiError } from '../api/errors';
import type { TestEmailRequestFunction } from '../features/stand-frontend/api/send-test-email';

export const mockRequestTestEmailSend: TestEmailRequestFunction = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				success: true,
				data: {
					testId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
					status: 'accepted',
					dryRun: true,
					plans: [
						{
							channel: 'newsletter',
							planId: '<notificationId>#newsletter',
							status: 'accepted',
						},
					],
					statusUrl: '/v1/notification-tests/<testId>/status',
				},
			});
		}, 500);
	});
};

export const mockFailingRequestTestEmailSend =
	(error: ApiError): TestEmailRequestFunction =>
	() => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					success: false,
					failure: error,
				});
			}, 500);
		});
	};
