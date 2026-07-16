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
import type { TabName, UserData } from '../types';
import { UserContext } from '../UserContext';

interface Props {
	children: ReactNode;
	contentId?: string;
	setTab: { (tab: TabName): void };
	currentTab: TabName;
}

const getInitials = (user: UserData): string => {
	const firstName = user.firstName?.[0] ?? '';
	const lastName = user.lastName?.[0] ?? '';
	return `${firstName}${lastName}`.toUpperCase() || 'U';
};

const navLinks: Record<TabName, { text: string }> = {
	create: {
		text: 'Create Notifications',
	},
	history: {
		text: 'Previously Sent',
	},
};

export const MainLayout = ({ children, currentTab, setTab }: Props) => {
	const user = useContext(UserContext);

	return (
		<Layout>
			<Layout.TopBar>
				<TopBar>
					<TopBarToolName
						name="Notifications Tool"
						favicon={{ icon: <Favicon icon="notifications" /> }}
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
