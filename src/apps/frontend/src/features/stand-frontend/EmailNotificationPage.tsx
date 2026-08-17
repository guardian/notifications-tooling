import type { AppConfig } from '@models';
import { useReducer, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { fetchCapiDataFromApi } from './api/fetch-capi-content';
import { requestEmailHtml } from './api/fetch-email-preview';
import { sendNotification } from './api/send-notification';
import { requestTestEmailSend } from './api/send-test-email';
import { MainLayout } from './components/MainLayout';
import { NoPermissionsTab } from './components/NotAvailableTab';
import { ConfigContext } from './ConfigContext';
import { getAppConfig } from './get-config';
import { defaultState, notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState } from './types';

export const EmailNotificationPage = () => {
	const [user] = useState<AppConfig | undefined>(getAppConfig());

	const [notification, updateNotification] = useReducer<
		NotificationState,
		[NotificationAction]
	>(notificationReducer, defaultState);

	const hasAccess = user?.permissions.includes('dispatch_access');

	return (
		<ConfigContext.Provider value={user}>
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
		</ConfigContext.Provider>
	);
};
