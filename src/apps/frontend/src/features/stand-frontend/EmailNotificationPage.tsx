import { useEffect, useState } from 'react';
import type { FrontendConfig } from '../../frontend-config';
import { frontendConfig } from '../../frontend-config';
import { DispatchTab } from './components/DispatchTab';
import { HistoryTab } from './components/HistoryTab';
import { MainLayout } from './components/MainLayout';
import type { TabName, UserResponse } from './types';
import { UserContext } from './UserContext';

let config: FrontendConfig | undefined = undefined;

const getAppConfig = async () => {
	if (config) {
		return config;
	}
	try {
		const configJson: unknown = await fetch('/config').then((response) =>
			response.json(),
		);
		config = frontendConfig.parse(configJson);
		return config;
	} catch (err) {
		console.error(err);
		throw new Error('getAppConfig failed');
	}
};

const getUser = async (): Promise<UserResponse> => {
	try {
		const { backendUrl } = await getAppConfig();
		const userResponseJson: unknown = await fetch(`${backendUrl}/v1/user`).then(
			(response) => response.json(),
		);
		return Promise.resolve(userResponseJson as UserResponse);
	} catch (err) {
		return Promise.reject(err instanceof Error ? err : new Error('UNKNOWN'));
	}
};

export const EmailNotificationPage = () => {
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
		void getUser()
			.then(setUser)
			.catch((err) => {
				console.error('failed to read user', err);
			});
	}, []);

	return (
		<UserContext.Provider value={user}>
			<MainLayout currentTab={currentTab} setTab={setCurrentTab}>
				{currentTab === 'create' && <DispatchTab />}
				{currentTab === 'history' && <HistoryTab />}
			</MainLayout>
		</UserContext.Provider>
	);
};
