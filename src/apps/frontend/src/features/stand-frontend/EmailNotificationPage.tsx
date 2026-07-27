import { useEffect, useState } from 'react';
import type { FrontendConfig } from '../../frontend-config';
import { DispatchTab } from './components/DispatchTab';
import { HistoryTab } from './components/HistoryTab';
import { MainLayout } from './components/MainLayout';
import { getAppConfig, getUser } from './get-config';
import type { TabName, UserResponse } from './types';
import { UserContext } from './UserContext';

export const EmailNotificationPage = () => {
	const [appConfig, setAppConfig] = useState<FrontendConfig>();
	const [user, setUser] = useState<UserResponse>();
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
		void getAppConfig()
			.then(setAppConfig)
			.catch((err) => {
				console.error('failed to get config', err);
			});
	}, []);

	useEffect(() => {
		if (!appConfig) {
			return;
		}
		void getUser(appConfig)
			.then(setUser)
			.catch((err) => {
				console.error('failed to read user', err);
			});
	}, [appConfig]);

	return (
		<UserContext.Provider value={user}>
			<MainLayout currentTab={currentTab} setTab={setCurrentTab}>
				{currentTab === 'create' && <DispatchTab />}
				{currentTab === 'history' && <HistoryTab />}
			</MainLayout>
		</UserContext.Provider>
	);
};
