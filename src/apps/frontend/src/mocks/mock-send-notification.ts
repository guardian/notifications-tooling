import type { SendingResult } from '../features/stand-frontend/types';
import {
	acceptedEmailSendResponse,
	unauthenticatedError,
} from './api-fixtures';

export const mockSendNotification = () => {
	return new Promise<SendingResult>((resolve) => {
		setTimeout(() => {
			resolve({
				ok: true,
				response: acceptedEmailSendResponse,
			});
		}, 500);
	});
};

export const mockSendRejectedNotification = () => {
	return new Promise<SendingResult>((resolve) => {
		setTimeout(() => {
			resolve({
				ok: false,
				response: unauthenticatedError,
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
