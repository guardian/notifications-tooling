import { useReducer, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { mockRequestEmailHtml } from '../../mocks/mock-fetch-email';
import { mockSendNotification } from '../../mocks/mock-send-notification';
import { fetchCapiDataFromApi } from './api/fetch-capi-content';
import { MainLayout } from './components/MainLayout';
import { NoPermissionsTab } from './components/NoPermissionsTab';
import { type AppConfig, getAppConfig } from './get-config';
import { defaultState, notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState } from './types';
import { UserContext } from './UserContext';

export const EmailNotificationPage = () => {
	const [user] = useState<AppConfig | undefined>(getAppConfig());

	const [notification, updateNotification] = useReducer<
		NotificationState,
		[NotificationAction]
	>(notificationReducer, defaultState);

	const hasAccess = user?.permissions.includes('dispatch_access');

	return (
		<UserContext.Provider value={user}>
			{hasAccess ? (
				<NotificationFormContext.Provider
					value={{
						notification,
						updateNotification,
						capiFetch: fetchCapiDataFromApi,
						sendNotification: mockSendNotification,
						requestEmailHtml: mockRequestEmailHtml,
					}}
				>
					<MainLayout>
						<Outlet />
					</MainLayout>
				</NotificationFormContext.Provider>
			) : (
				<MainLayout>
					<NoPermissionsTab />
				</MainLayout>
			)}
		</UserContext.Provider>
	);
};
