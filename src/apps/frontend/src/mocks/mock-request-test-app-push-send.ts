import type { TestAppPushRequestFunction } from '../features/stand-frontend/api/send-test-app-push';

export const mockRequestTestAppPushSend: TestAppPushRequestFunction = () =>
	Promise.resolve({
		success: true,
		data: {
			testId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
			status: 'accepted',
			dryRun: false,
			plans: [
				{
					channel: 'app-push',
					planId: '<notificationId>#app-push',
					status: 'accepted',
				},
			],
			statusUrl: '/v1/notification-tests/<testId>/status',
		},
	});
