import type { ApiError } from '../api/errors';
import type { TestEmailRequestFunction } from '../features/stand-frontend/api/send-test-email';

export const mockRequestTestEmailSend: TestEmailRequestFunction = () => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				success: true,
				data: {
					id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
					idempotencyKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
					kind: 'test',
					status: 'accepted',
					sender: 'notifications-tooling-spa/v1',
					dryRun: true,
					scheduledFor: null,
					createdAt: '2026-08-25T00:00:00.000Z',
					dispatches: [],
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
