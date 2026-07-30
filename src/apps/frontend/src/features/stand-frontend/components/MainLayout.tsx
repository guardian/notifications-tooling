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
import type { UserResponse } from '../get-user';
import { faviconTheme, topBarTheme } from '../themes';
import type { TabName } from '../types';
import { UserContext } from '../UserContext';

interface Props {
	children: ReactNode;
	contentId?: string;
	setTab: { (tab: TabName): void };
	currentTab: TabName;
}

const getInitials = (user: UserResponse["user"]): string => {
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
	const userResponse = useContext(UserContext);

	return (
		<Layout>
			<Layout.TopBar>
				<TopBar theme={topBarTheme}>
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
					{userResponse && (
						<Avatar
							src={userResponse.user.avatarUrl}
							alt={`${userResponse.user.firstName} ${userResponse.user.lastName}`.trim() || userResponse.user.email}
							initials={getInitials(userResponse.user)}
							size="md"
						/>
					)}
				</TopBar>
			</Layout.TopBar>
			{children}
		</Layout>
	);
};
