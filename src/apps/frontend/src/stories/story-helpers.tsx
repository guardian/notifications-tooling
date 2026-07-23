import { type ReactNode, useReducer } from 'react';
import {
	defaultState,
	notificationReducer,
} from '../features/stand-frontend/notification-reducer';
import { NotificationFormContext } from '../features/stand-frontend/NotificationContext';
import type {
	NotificationAction,
	NotificationState,
} from '../features/stand-frontend/types';
import { mockCapiFetch } from '../mocks/mock-capi-fetch';
import { mockSendNotification } from '../mocks/mock-send-notification';

export const WithNotificationContext = (
	reactNode: ReactNode,
	notificationState: NotificationState = defaultState,
) => {
	const [notification, updateNotification] = useReducer<
		NotificationState,
		[NotificationAction]
	>(notificationReducer, notificationState);

	return (
		<NotificationFormContext
			value={{
				notification,
				updateNotification,
				capiFetch: mockCapiFetch,
				sendNotification: mockSendNotification,
			}}
		>
			{reactNode}
		</NotificationFormContext>
	);
};
