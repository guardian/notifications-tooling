import type { ResolveArticleRequest, ResolveArticleResponse } from '@models';
import type { ActionDispatch } from 'react';
import { createContext } from 'react';
import type { SendNotificationRequest } from './api/schemas';
import type {
	NotificationAction,
	NotificationState,
	RequestEmailHtml,
	SendingResult,
} from './types';

export interface NotificationFormContextProps {
	notification: NotificationState;
	updateNotification: ActionDispatch<[NotificationAction]>;
	capiFetch: {
		(request: ResolveArticleRequest): Promise<ResolveArticleResponse>;
	};
	// TO DO - get the required payload from the backend
	sendNotification: {
		(sendNotificationRequest: SendNotificationRequest): Promise<SendingResult>;
	};
	requestEmailHtml: RequestEmailHtml;
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
			Promise.reject(new Error('no capiFetch implementation provided')),
		sendNotification: () =>
			Promise.reject(new Error('no sendNotification implementation provided')),
		requestEmailHtml: () =>
			Promise.reject(new Error('no requestEmailHtml implementation provided')),
	});
