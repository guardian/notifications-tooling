import type { ResolveArticleRequest, ResolveArticleResponse } from '@models';
import type { ActionDispatch } from 'react';
import { createContext } from 'react';
import type { Result } from '../../api/client';
import { ApiError } from '../../api/errors';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from './api/schemas';
import type { TestEmailRequestFunction } from './api/send-test-email';
import type {
	NotificationAction,
	NotificationState,
	RequestEmailHtml,
} from './types';

export interface NotificationFormContextProps {
	notification: NotificationState;
	updateNotification: ActionDispatch<[NotificationAction]>;
	capiFetch: {
		(request: ResolveArticleRequest): Promise<Result<ResolveArticleResponse>>;
	};
	// TO DO - get the required payload from the backend
	sendNotification: {
		(
			sendNotificationRequest: SendNotificationRequest,
		): Promise<Result<SendNotificationResponse>>;
	};
	requestEmailHtml: RequestEmailHtml;
	requestTestEmailSend: TestEmailRequestFunction;
}

export const NotificationFormContext =
	createContext<NotificationFormContextProps>({
		notification: {
			isFetchingContent: false,
			isWaitingForSend: false,
			hasAttemptedSend: false,
			confirmSendModalOpen: false,
		},
		updateNotification: () => {},
		capiFetch: () =>
			Promise.resolve({
				success: false,
				failure: new ApiError({
					message: 'no capiFetch implementation provided',
					failure: 'fetch-fail',
				}),
			}),
		sendNotification: () =>
			Promise.resolve({
				success: false,
				failure: new ApiError({
					message: 'no sendNotification implementation provided',
					failure: 'fetch-fail',
				}),
			}),
		requestEmailHtml: () =>
			Promise.reject(new Error('no requestEmailHtml implementation provided')),
		requestTestEmailSend: () =>
			Promise.resolve({
				success: false,
				failure: new ApiError({
					message: 'no requestTestEmailSend implementation provided',
					failure: 'fetch-fail',
				}),
			}),
	});
