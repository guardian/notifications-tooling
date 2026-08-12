import { css } from '@emotion/react';
import { Avatar } from '@guardian/stand/Avatar';
import { Favicon } from '@guardian/stand/Favicon';
import { Layout } from '@guardian/stand/Layout';
import {
	TopBar,
	TopBarContainerLeft,
	TopBarNavigation,
	TopBarToolName,
} from '@guardian/stand/TopBar';
import { type ReactNode, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import type { AppConfig } from '../get-config';
import { faviconTheme, topBarTheme } from '../themes';
import { UserContext } from '../UserContext';

interface Props {
	children: ReactNode;
	contentId?: string;
}

const getInitials = (user: AppConfig['user']): string => {
	const firstName = user.firstName[0] ?? '';
	const lastName = user.lastName[0] ?? '';
	return `${firstName}${lastName}`.toUpperCase() || 'U';
};

const navLinks = [
	{ text: 'Create', path: '/create' },
	{ text: 'History', path: '/history' },
] as const;

export const MainLayout = ({ children }: Props) => {
	const { user } = useContext(UserContext) ?? {};
	const { pathname } = useLocation();

	return (
		<Layout>
			<Layout.TopBar
				cssOverrides={css({ position: 'sticky', top: 0, zIndex: 2 })}
			>
				<TopBar theme={topBarTheme}>
					<TopBarToolName
						name="Dispatch"
						favicon={{
							icon: <Favicon icon="notifications" theme={faviconTheme} />,
						}}
					/>
					<TopBarContainerLeft>
						{navLinks.map(({ text, path }) => (
							<TopBarNavigation
								key={path}
								text={text}
								isSelected={pathname === path}
								href={path}
							/>
						))}
					</TopBarContainerLeft>
					{user && (
						<Avatar
							src={user.avatarUrl}
							alt={`${user.firstName} ${user.lastName}`.trim() || user.email}
							initials={getInitials(user)}
							size="md"
						/>
					)}
				</TopBar>
			</Layout.TopBar>
			{children}
		</Layout>
	);
};
