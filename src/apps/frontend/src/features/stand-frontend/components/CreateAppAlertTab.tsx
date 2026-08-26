import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { from } from '@guardian/stand/utils';
import { useContext, useState } from 'react';
import {
	FALLBACK_TOPIC_TYPES,
	useChannelAudiences,
} from '../api/useChannelAudiences';
import { NotificationFormContext } from '../NotificationContext';
import { layoutMainTheme } from '../themes';
import { AppPreviewSection } from './AppPreviewSection';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { AppAlertDispatchDetails, DispatchReport } from './DispatchReport';
import { NoSendPermissionWarning } from './NoSendPermissionWarning';
import { AppPreviewToggle } from './PreviewToggle';
import {
	APP_DEFAULT_SIDE_NAV_HREF,
	SideNavigationPanel,
} from './SideNavigationPanel';

export const CreateAppAlertTab = () => {
	const {
		notification: { sendingResult },
		updateNotification,
	} = useContext(NotificationFormContext);
	const [selectedHref, setSelectedHref] = useState(APP_DEFAULT_SIDE_NAV_HREF);
	const { data: audiences } = useChannelAudiences();

	console.log(audiences);
	const topicTypes =
		audiences?.channels['app-push'].topicTypes ?? FALLBACK_TOPIC_TYPES;

	return (
		<>
			{!sendingResult?.success && (
				<Layout.Sidebar layoutSmBreakpoint="hidden">
					<SideNavigationPanel
						selectedHref={selectedHref}
						onSelectedHrefChange={setSelectedHref}
						channel={'push'}
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
							<DispatchReport
								onResetNotification={() =>
									updateNotification({ type: 'reset-app-alert' })
								}
							>
								<AppAlertDispatchDetails />
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
								<AppPreviewToggle topicTypes={topicTypes} />
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
									<CreateAppAlertForm activeSectionHref={selectedHref} />
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
								<AppPreviewSection topicTypes={topicTypes} />
							</Item>
						</>
					)}
				</Grid>
			</Layout.Main>
		</>
	);
};
