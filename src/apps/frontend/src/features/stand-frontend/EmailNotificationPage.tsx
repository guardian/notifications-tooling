import { useEffect, useReducer, useState } from 'react';
import { mockCapiFetch } from '../../mocks/mock-capi-fetch';
import { mockSendNotification } from '../../mocks/mock-send-notification';
import { DispatchTab } from './components/DispatchTab';
import { HistoryTab } from './components/HistoryTab';
import { MainLayout } from './components/MainLayout';
import { defaultState, notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type {
	NotificationAction,
	NotificationState,
	TabName,
	UserData,
} from './types';
import { UserContext } from './UserContext';

// TO DO - fetch from backend? inject user details onto page?
const getUser = (): Promise<UserData> => {
	try {
		return Promise.resolve({
			firstName: 'John',
			lastName: 'Doe',
			email: 'j.Doe@example.com',
			permissions: {},
		});
	} catch (err) {
		return Promise.reject(err instanceof Error ? err : new Error('UNKNOWN'));
	}
};

export const EmailNotificationPage = () => {
	const [user, setUser] = useState<UserData>();
	const [currentTab, setCurrentTab] = useState<TabName>(() => {
		switch (location.hash) {
			case '#history':
				return 'history';
			case '#create':
			default:
				return 'create';
		}
	});
	useEffect(() => {
		void getUser()
			.then(setUser)
			.catch((err) => {
				console.error('failed to read user', err);
			});
	}, []);

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
					capiFetch: mockCapiFetch,
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
