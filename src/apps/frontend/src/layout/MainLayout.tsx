import { css } from '@emotion/react';
import { baseColors } from '@guardian/stand';
import { Avatar } from '@guardian/stand/Avatar';
import { Badge } from '@guardian/stand/Badge';
import { Favicon } from '@guardian/stand/Favicon';
import { Layout } from '@guardian/stand/Layout';
import {
	TopBar,
	TopBarContainerLeft,
	TopBarContainerRight,
	TopBarItem,
	TopBarNavigation,
	TopBarToolName,
} from '@guardian/stand/TopBar';
import type { AppConfig } from '@models';
import { type ReactNode, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ConfigContext } from '../config/ConfigContext';
import { getAppRoutes, getTopBarNavigationItems } from '../routes';
import { faviconTheme, layer, topBarTheme } from '../themes';

interface Props {
	children: ReactNode;
	contentId?: string;
}

const getInitials = (user: AppConfig['user']): string => {
	const firstName = user.firstName[0] ?? '';
	const lastName = user.lastName[0] ?? '';
	return `${firstName}${lastName}`.toUpperCase() || 'U';
};

export const MainLayout = ({ children }: Props) => {
	const config = useContext(ConfigContext);
	const routes = getAppRoutes(config);
	const { user } = config ?? {};
	const { pathname } = useLocation();
	const stage = config?.stage;
	const shouldShowEnvBadge = stage !== undefined && stage !== 'PROD';

	return (
		<Layout>
			<Layout.TopBar
				cssOverrides={css({ position: 'sticky', top: 0, zIndex: layer.topBar })}
			>
				<TopBar theme={topBarTheme}>
					<TopBarToolName
						name="Dispatch"
						href={routes.dispatchLanding}
						favicon={{
							icon: <Favicon icon="notifications" theme={faviconTheme} />,
						}}
						hoverText=""
						collapsedHoverText=""
					/>
					<TopBarContainerLeft>
						{getTopBarNavigationItems(config).map(
							({ text, path, activePaths }) => (
								<TopBarNavigation
									key={path}
									text={text}
									isSelected={activePaths.includes(pathname)}
									href={path}
								/>
							),
						)}
					</TopBarContainerLeft>
					{shouldShowEnvBadge && (
						<TopBarContainerRight>
							<TopBarItem>
								<Badge
									size="md"
									weight="strong"
									cssOverrides={css({
										color: 'white',
										backgroundColor: baseColors.magenta['200'],
									})}
								>
									{stage}
								</Badge>
							</TopBarItem>
						</TopBarContainerRight>
					)}
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
