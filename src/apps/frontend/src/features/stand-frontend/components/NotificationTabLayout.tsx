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
import { NotificationFormContext } from '../NotificationContext';
import { layoutMainTheme } from '../themes';
import type { ChannelOption } from '../types';
import { DispatchReport } from './DispatchReport';
import { NoSendPermissionWarning } from './NoSendPermissionWarning';
import {
	DEFAULT_SIDE_NAV_HREF_BY_CHANNEL,
	SideNavigationPanel,
} from './SideNavigationPanel';

interface NotificationTabLayoutProps {
	channel: ChannelOption;
	onResetNotification: () => void;
	previewToggle: ReactNode;
	renderForm: (activeSectionHref: string) => ReactNode;
	previewSection: ReactNode;
	dispatchDetails: ReactNode;
}

export const NotificationTabLayout = ({
	channel,
	onResetNotification,
	previewToggle,
	renderForm,
	previewSection,
	dispatchDetails,
}: NotificationTabLayoutProps) => {
	const {
		notification: { sendingResult },
	} = useContext(NotificationFormContext);
	const [selectedHref, setSelectedHref] = useState(
		DEFAULT_SIDE_NAV_HREF_BY_CHANNEL[channel],
	);

	return (
		<>
			{!sendingResult?.success && (
				<Layout.Sidebar layoutSmBreakpoint="hidden">
					<SideNavigationPanel
						selectedHref={selectedHref}
						onSelectedHrefChange={setSelectedHref}
						channel={channel}
					/>
				</Layout.Sidebar>
			)}
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
					{sendingResult?.success === true ? (
						<Item
							size={12}
							cssOverrides={css({
								paddingTop: semanticSpacing.stackXl,
								paddingLeft: semanticSpacing.stackLg,
								paddingRight: semanticSpacing.stackLg,
							})}
						>
							<DispatchReport onResetNotification={onResetNotification}>
								{dispatchDetails}
							</DispatchReport>
						</Item>
					) : (
						<>
							<Item
								size={'grow'}
								cssOverrides={css({
									maxWidth: '826px',
									minWidth: 0,
								})}
							>
								<NoSendPermissionWarning />
								{previewToggle}
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
						</>
					)}
				</Grid>
			</Layout.Main>
		</>
	);
};
