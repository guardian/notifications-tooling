import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { NoPermissionsTab } from './components/NoPermissionsTab';
import { ConfigContext } from './ConfigContext';
import { NotificationDraftsProvider } from './NotificationFormProvider';

export const EmailNotificationPage = () => {
	const config = useContext(ConfigContext);
	const hasAccess = config?.permissions.includes('dispatch_access');

	return (
		<>
			{hasAccess ? (
				<NotificationDraftsProvider>
					<MainLayout>
						<Outlet />
					</MainLayout>
				</NotificationDraftsProvider>
			) : (
				<MainLayout>
					<NoPermissionsTab />
				</MainLayout>
			)}
		</>
	);
};
