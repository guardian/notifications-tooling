import { ApiError } from '../api/errors';
import type { SendNotificationResponse } from '../features/stand-frontend/api/schemas';

export const unauthenticatedError = new ApiError({
	failure: 'unauthenticated',
	message: 'Authentication is required to access this resource.',
});

export const acceptedEmailSendResponse: SendNotificationResponse = {
	status: 'accepted',
	notificationId: '1234-abcd',
	plans: [
		{
			channel: 'newsletter',
			planId: 'plan9',
			status: 'accepted',
		},
	],
	statusUrl: 'example.com/status/1234-abcd',
	cancellable: {
		cancelUrl: 'example.com/cancel/1234-abcd',
		expiresAt: 0,
	},
};
