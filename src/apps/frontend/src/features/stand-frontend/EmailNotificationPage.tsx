import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { UserPermissions } from '../../../../../packages/models';
import { MainLayout } from './components/MainLayout';
import { NoPermissionsTab } from './components/NoPermissionsTab';
import { ConfigContext } from './ConfigContext';

export const EmailNotificationPage = () => {
	const config = useContext(ConfigContext);
	const hasAccess = config?.permissions.includes(
		UserPermissions.DispatchAccess,
	);

	return (
		<>
			{hasAccess ? (
				<MainLayout>
					<Outlet />
				</MainLayout>
			) : (
				<MainLayout>
					<NoPermissionsTab />
				</MainLayout>
			)}
		</>
	);
};
