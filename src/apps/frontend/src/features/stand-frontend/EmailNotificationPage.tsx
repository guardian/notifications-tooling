import { useContext, useReducer } from 'react';
import { Outlet } from 'react-router-dom';
import { fetchCapiDataFromApi } from './api/fetch-capi-content';
import { requestEmailHtml } from './api/fetch-email-preview';
import { sendNotification } from './api/send-notification';
import { requestTestEmailSend } from './api/send-test-email';
import { MainLayout } from './components/MainLayout';
import { NoPermissionsTab } from './components/NoPermissionsTab';
import { ConfigContext } from './ConfigContext';
import { defaultState, notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState } from './types';

export const EmailNotificationPage = () => {
	const config = useContext(ConfigContext);

	const [notification, updateNotification] = useReducer<
		NotificationState,
		[NotificationAction]
	>(notificationReducer, defaultState);

	const hasAccess = config?.permissions.includes('dispatch_access');

	return (
		<>
			{hasAccess ? (
				<NotificationFormContext.Provider
					value={{
						notification,
						updateNotification,
						capiFetch: fetchCapiDataFromApi,
						requestEmailHtml: requestEmailHtml,
						sendNotification: sendNotification,
						requestTestEmailSend: requestTestEmailSend,
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
		</>
	);
};
