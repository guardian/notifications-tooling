import type { ReactNode } from 'react';
import { defaultState } from '../features/stand-frontend/notification-reducer';
import { NotificationContext } from '../features/stand-frontend/NotificationContext';
import type { NotificationState } from '../features/stand-frontend/types';

export const WithNotificationContext = (
	reactNode: ReactNode,
	notificationState: NotificationState = defaultState,
) => {
	return (
		<NotificationContext
			value={{
				notification: notificationState,
				updateNotification: () => {},
			}}
		>
			{reactNode}
		</NotificationContext>
	);
};
