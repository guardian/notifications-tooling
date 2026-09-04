import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { from } from '@guardian/stand/utils';
import type { ReactNode } from 'react';
import { useContext, useState } from 'react';
import {
	DEFAULT_SIDE_NAV_HREF_BY_CHANNEL,
	SideNavigationPanel,
} from '../layout/SideNavigationPanel';
import { layoutMainTheme } from '../themes';
import type { ChannelOption } from '../types';
import { NoSendPermissionWarning } from './NoSendPermissionWarning';
import { NotificationFormContext } from './NotificationContext';

interface NotificationTabLayoutProps {
	channel: ChannelOption;
	previewToggle: ReactNode;
	renderForm: (activeSectionHref: string) => ReactNode;
	previewSection: ReactNode;
}

export const NotificationTabLayout = ({
	channel,
	previewToggle,
	renderForm,
	previewSection,
}: NotificationTabLayoutProps) => {
	const {
		notification: { content },
	} = useContext(NotificationFormContext);
	const hasPreview = Boolean(content);
	const [selectedHref, setSelectedHref] = useState(
		DEFAULT_SIDE_NAV_HREF_BY_CHANNEL[channel],
	);

	return (
		<>
			<Layout.Sidebar layoutSmBreakpoint="hidden">
				<SideNavigationPanel
					selectedHref={selectedHref}
					onSelectedHrefChange={setSelectedHref}
					channel={channel}
				/>
			</Layout.Sidebar>
			<Layout.Main theme={layoutMainTheme}>
				<Grid
					cssOverrides={css({
						height: '100%',
						'@media (min-width: 1310px)': {
							flexWrap: 'nowrap',
						},
					})}
					theme={{
						sm: { gap: '0px', padding: `0px 0px 0px` },
						md: { gap: '0px', padding: `0px 0px 0px` },
						lg: { gap: '0px', padding: `0px 0px 0px` },
					}}
				>
					<>
						<Item
							size={'grow'}
							cssOverrides={css({
								maxWidth: '826px',
								minWidth: 0,
							})}
						>
							<NoSendPermissionWarning />
							{hasPreview && previewToggle}
							<div
								css={css({
									position: 'relative',
									display: 'flex',
									paddingLeft: semanticSpacing.stackMd,
									borderLeft: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
									[from.md]: { paddingLeft: semanticSpacing.stackXl },
									'@media (min-width: 1500px)': {
										paddingLeft: '147px',
									},
								})}
							>
								{renderForm(selectedHref)}
							</div>
						</Item>
						{hasPreview && (
							<Item
								size={'grow'}
								cssOverrides={css({
									display: 'none',
									justifyContent: 'center',
									alignItems: 'flex-start',
									flow: 'vertical',
									['@media (min-width: 1310px)']: {
										display: 'flex',
										flex: '0 0 474px',
										marginLeft: 'auto',
										maxWidth: '474px',
									},
								})}
							>
								{previewSection}
							</Item>
						)}
					</>
				</Grid>
			</Layout.Main>
		</>
	);
};
