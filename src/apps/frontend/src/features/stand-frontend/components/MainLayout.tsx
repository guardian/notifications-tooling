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
import type { AppConfig } from '../get-config';
import { faviconTheme, topBarTheme } from '../themes';
import type { TabName } from '../types';
import { UserContext } from '../UserContext';

interface Props {
	children: ReactNode;
	contentId?: string;
	setTab: { (tab: TabName): void };
	currentTab: TabName;
}

const getInitials = (user: AppConfig['user']): string => {
	const firstName = user.firstName[0] ?? '';
	const lastName = user.lastName[0] ?? '';
	return `${firstName}${lastName}`.toUpperCase() || 'U';
};

const navLinks: Record<TabName, { text: string }> = {
	create: {
		text: 'Create notification',
	},
	history: {
		text: 'History',
	},
};

export const MainLayout = ({ children, currentTab, setTab }: Props) => {
	const { user } = useContext(UserContext) ?? {};

	return (
		<Layout>
			<Layout.TopBar>
				<TopBar
					theme={topBarTheme}
					cssOverrides={css({ position: 'sticky', top: '0px', zIndex: 1 })}
				>
					<TopBarToolName
						name="Notifications"
						favicon={{
							icon: <Favicon icon="notifications" theme={faviconTheme} />,
						}}
					/>
					<TopBarContainerLeft>
						{Object.entries(navLinks).map(([tabName, { text }]) => (
							<TopBarNavigation
								key={tabName}
								text={text}
								isSelected={currentTab === tabName}
								onPress={() => setTab(tabName as TabName)}
								href={`#${tabName}`}
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
