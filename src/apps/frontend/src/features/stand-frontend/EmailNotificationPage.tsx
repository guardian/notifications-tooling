import { useReducer, useState } from 'react';
import { hackyClientSideCapiFetch } from '../../mocks/mock-capi-fetch';
import { mockSendNotification } from '../../mocks/mock-send-notification';
import { DispatchTab } from './components/DispatchTab';
import { HistoryTab } from './components/HistoryTab';
import { MainLayout } from './components/MainLayout';
import { getUser } from './get-user';
import { defaultState, notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState, TabName } from './types';
import { UserContext } from './UserContext';

export const EmailNotificationPage = () => {
	const user = getUser();
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

	return (
		<UserContext.Provider value={user}>
			<NotificationFormContext.Provider
				value={{
					notification,
					updateNotification,
					capiFetch: hackyClientSideCapiFetch,
					sendNotification: mockSendNotification,
				}}
			>
				<MainLayout currentTab={currentTab} setTab={setCurrentTab}>
					{currentTab === 'create' && <DispatchTab />}
					{currentTab === 'history' && <HistoryTab />}
				</MainLayout>
			</NotificationFormContext.Provider>
		</UserContext.Provider>
	);
};
