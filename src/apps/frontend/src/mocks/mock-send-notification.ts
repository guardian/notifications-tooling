import type { SendingResult } from '@models';

export const mockSendNotification = () => {
	return new Promise<SendingResult>((resolve) => {
		setTimeout(() => {
			resolve({
				ok: true,
				response: {
					status: 'accepted',
				},
			});
		}, 500);
	});
};

export const mockSendRejectedNotification = () => {
	return new Promise<SendingResult>((resolve) => {
		setTimeout(() => {
			resolve({
				ok: false,
				response: {
					error: 'unauthenticated',
					message: 'Authentication is required to access this resource.',
				},
			});
		}, 500);
	});
};

export const mockSendFailingRequest = () => {
	return new Promise<SendingResult>((resolve) => {
		setTimeout(() => {
			resolve({
				ok: false,
				requestFailed: true,
			});
		}, 500);
	});
};
