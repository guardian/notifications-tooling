import { useEffect, useReducer, useRef, useState } from 'react';
import { hackyClientSideCapiFetch } from '../../mocks/mock-capi-fetch';
import { mockRequestEmailHtml } from '../../mocks/mock-fetch-email';
import { mockSendNotification } from '../../mocks/mock-send-notification';
import { DispatchTab } from './components/DispatchTab';
import { HistoryTab } from './components/HistoryTab';
import { MainLayout } from './components/MainLayout';
import { NoPermissionsTab } from './components/NoPermissionsTab';
import { getAppConfig, type UserResponse } from './get-config';
import { defaultState, notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState, TabName } from './types';
import { UserContext } from './UserContext';


// The `presetUser` prop is only to support the Page story with the test user populated
// it would be preferable to mock the `get-config` module, but there seems to be some
// difficulty doing storybook mocks in bun.
export const EmailNotificationPage = ({
	presetUser,
}: {
	presetUser?: UserResponse | undefined;
}) => {
	const [user, setUser] = useState<UserResponse | undefined>(presetUser);
	const [userLoadingError, setUserLoadingError] = useState<Error>();
	const hasStartedUserFetch = useRef(false);

	useEffect(() => {
		if (presetUser || hasStartedUserFetch.current) {
			return;
		}
		hasStartedUserFetch.current = true;
		getAppConfig()
			.then(setUser)
			.catch((err) => {
				console.error('failed to get user details', err);
				setUserLoadingError(
					err instanceof Error ? err : new Error('Unknown get user Error'),
				);
			});
	}, [presetUser]);

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
						requestEmailHtml: mockRequestEmailHtml,
					}}
				>
					<MainLayout currentTab={currentTab} setTab={setCurrentTab}>
						{currentTab === 'create' && <DispatchTab />}
						{currentTab === 'history' && <HistoryTab />}
					</MainLayout>
				</NotificationFormContext.Provider>
			) : (
				<MainLayout currentTab={currentTab} setTab={() => {}}>
					<NoPermissionsTab
						userLoaded={!!user}
						userLoadingError={userLoadingError}
					/>
				</MainLayout>
			)}
		</UserContext.Provider>
	);
};
