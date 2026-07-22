import type { Content } from '@guardian/content-api-models/v1/content';
import type { ActionDispatch } from 'react';
import { createContext } from 'react';
import type {
	NotificationAction,
	NotificationState,
	SendingResult,
} from './types';

export const NotificationFormContext = createContext<{
	notification: NotificationState;
	updateNotification: ActionDispatch<[NotificationAction]>;
	// TO DO - get the required payload from the backend
	capiFetch: { (articleId: string): Promise<Content> };
	// TO DO - get the required payload from the backend
	sendNotification: {
		(notification: NotificationState): Promise<SendingResult>;
	};
}>({
	notification: {
		isFetchingContent: false,
		isWaitingForSend: false,
		confirmSendModalOpen: false,
	},
	updateNotification: () => {},
	capiFetch: () =>
		Promise.reject(new Error('no capiFetch implementation provided')),
	sendNotification: () =>
		Promise.reject(new Error('no sendNotification implementation provided')),
});
