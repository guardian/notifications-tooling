import { useEffect, useReducer, useState } from 'react';
import { DispatchTab } from './components/DispatchTab';
import { HistoryTab } from './components/HistoryTab';
import { MainLayout } from './components/MainLayout';
import { NotificationContext } from './NotificationContext';
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
	>(
		(
			prevState: NotificationState,
			action: NotificationAction,
		): NotificationState => {
			const state = structuredClone(prevState);
			switch (action.type) {
				case 'set-article-id': {
					return { ...state, articleId: action.text };
				}

				case 'modify-email-parameters': {
					if (state.parameters?.type !== 'email') {
						return state;
					}
					return {
						...state,
						parameters: { ...state.parameters, ...action.mod },
					};
				}
			}
		},
		{
			parameters: {
				type: 'email',
				kicker: 'breaking-news',
			},
		},
	);

	return (
		<UserContext.Provider value={user}>
			<NotificationContext.Provider
				value={{ notification, updateNotification }}
			>
				<MainLayout currentTab={currentTab} setTab={setCurrentTab}>
					{currentTab === 'create' && <DispatchTab />}
					{currentTab === 'history' && <HistoryTab />}
				</MainLayout>
			</NotificationContext.Provider>
		</UserContext.Provider>
	);
};
