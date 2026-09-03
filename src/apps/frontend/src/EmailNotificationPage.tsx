import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { UserPermissions } from '../../../packages/models';
import { ConfigContext } from './config/ConfigContext';
import { MainLayout } from './layout/MainLayout';
import { NoPermissionsTab } from './layout/NoPermissionsTab';

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
