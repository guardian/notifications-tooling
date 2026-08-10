import { useReducer, useState } from 'react';
import { hackyClientSideCapiFetch } from '../../mocks/mock-capi-fetch';
import { mockSendNotification } from '../../mocks/mock-send-notification';
import { requestEmailHtml } from './api/fetch-email-preview';
import { DispatchTab } from './components/DispatchTab';
import { HistoryTab } from './components/HistoryTab';
import { MainLayout } from './components/MainLayout';
import { NoPermissionsTab } from './components/NoPermissionsTab';
import { type AppConfig, getAppConfig } from './get-config';
import { defaultState, notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState, TabName } from './types';
import { UserContext } from './UserContext';

export const EmailNotificationPage = () => {
	const [user] = useState<AppConfig | undefined>(getAppConfig());
	const [currentTab, setCurrentTab] = useState<TabName>(() => {
		switch (location.hash) {
			case '#history':
				return 'history';
			case '#create':
			default:
				return 'create';
		}
	});

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
						capiFetch: hackyClientSideCapiFetch,
						sendNotification: mockSendNotification,
						requestEmailHtml: requestEmailHtml,
					}}
				>
					<MainLayout currentTab={currentTab} setTab={setCurrentTab}>
						{currentTab === 'create' && <DispatchTab />}
						{currentTab === 'history' && <HistoryTab />}
					</MainLayout>
				</NotificationFormContext.Provider>
			) : (
				<MainLayout currentTab={currentTab} setTab={() => {}}>
					<NoPermissionsTab />
				</MainLayout>
			)}
		</UserContext.Provider>
	);
};
