import type { ApiError } from '../api-client/errors';
import type { TestEmailRequestFunction } from '../send/send-test-email';

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
					createdByEmail: 'ada.lovelace@guardian.co.uk',
					dryRun: true,
					scheduledFor: null,
					content: {},
					channels: {},
					createdAt: '2026-08-25T00:00:00.000Z',
					updatedAt: '2026-08-25T00:00:00.000Z',
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
