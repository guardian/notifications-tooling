import type { SendingResult } from '../features/stand-frontend/types';

export const mockSendNotification = () => {
	return new Promise<SendingResult>((resolve) => {
		setTimeout(() => {
			resolve({ ok: true });
		}, 500);
	});
};

export const mockSendFailingNotification = () => {
	return new Promise<SendingResult>((resolve) => {
		setTimeout(() => {
			resolve({ ok: false });
		}, 500);
	});
};
