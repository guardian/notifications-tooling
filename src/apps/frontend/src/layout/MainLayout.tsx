import { css } from '@emotion/react';
import { baseColors } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Avatar } from '@guardian/stand/Avatar';
import { Favicon } from '@guardian/stand/Favicon';
import { Layout } from '@guardian/stand/Layout';
import {
	TopBar,
	TopBarContainerLeft,
	TopBarNavigation,
	TopBarToolName,
} from '@guardian/stand/TopBar';
import { Typography } from '@guardian/stand/Typography';
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
					{user && (
						<Avatar
							src={user.avatarUrl}
							alt={`${user.firstName} ${user.lastName}`.trim() || user.email}
							initials={getInitials(user)}
							size="md"
						/>
					)}
				</TopBar>
				{shouldShowEnvBadge && (
					<AlertBanner
						level="information"
						theme={{
							information: {
								backgroundColor:
									stage === 'CODE'
										? baseColors.magenta['800']
										: baseColors.neutral['600'],
							},
						}}
					>
						<Typography
							variant="headingCompactMd"
							color={baseColors.neutral['0']}
						>
							You are working in the {stage} Environment
						</Typography>
					</AlertBanner>
				)}
			</Layout.TopBar>
			{children}
		</Layout>
	);
};
