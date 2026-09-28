import { css } from '@emotion/react';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Link } from '@guardian/stand/Link';
import { UserPermissions } from '@models';
import { useContext } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import { CENTRAL_PRODUCTION_CONTACT_HREF } from '../support-links';

export const NoSendPermissionWarning = () => {
	const { permissions = [] } = useContext(ConfigContext) ?? {};
	if (permissions.includes(UserPermissions.SendNotification)) {
		return null;
	}

	return (
		<AlertBanner
			level="warning"
			showIcon
			cssOverrides={css({
				height: 'unset',
				minHeight: '2.5rem',
			})}
		>
			<span>
				You do not have permission to send notifications using Dispatch. Please
				contact{' '}
				<Link href={CENTRAL_PRODUCTION_CONTACT_HREF}>Central Production</Link>{' '}
				if you need permission.
			</span>
		</AlertBanner>
	);
};
