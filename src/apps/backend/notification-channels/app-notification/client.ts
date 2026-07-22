import type { AppNotificationRequest } from './generate-request';

export type MockAppNotificationClient = {
	send: (request: AppNotificationRequest) => Promise<{ status: 'mocked' }>;
};

export const createMockAppNotificationClient =
	(): MockAppNotificationClient => ({
		send: () => Promise.resolve({ status: 'mocked' }),
	});
