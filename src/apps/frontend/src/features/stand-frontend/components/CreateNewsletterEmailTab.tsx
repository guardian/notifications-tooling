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
import { NotificationFormContext } from '../NotificationContext';
import { layoutMainTheme } from '../themes';
import { CreateNotificationForm } from './CreateNotificationForm';
import { DispatchReport } from './DispatchReport';
import { EmailPreviewSection } from './EmailPreviewSection';
import { PreviewToggle } from './PreviewToggle';
import {
	DEFAULT_SIDE_NAV_HREF,
	SideNavigationPanel,
} from './SideNavigationPanel';

export const CreateNewsletterEmailTab = () => {
	const {
		notification: { sendingResult, parameters },
	} = useContext(NotificationFormContext);
	const [selectedHref, setSelectedHref] = useState(DEFAULT_SIDE_NAV_HREF);

	return (
		<>
			{!sendingResult?.ok && (
				<Layout.Sidebar layoutSmBreakpoint="above-grid">
					<SideNavigationPanel
						selectedHref={selectedHref}
						onSelectedHrefChange={setSelectedHref}
					/>
				</Layout.Sidebar>
			)}
			<Layout.Main theme={layoutMainTheme}>
				<Grid
					cssOverrides={css({
						height: '100%',
					})}
					theme={{
						sm: { gap: '0px', padding: `0px 0px 0px` },
						md: { gap: '0px', padding: `0px 0px 0px` },
						lg: { gap: '0px', padding: `0px 0px 0px` },
					}}
				>
					{sendingResult?.ok === true ? (
						<Item
							size={12}
							cssOverrides={css({
								paddingTop: semanticSpacing.stackXl,
								paddingLeft: semanticSpacing.stackLg,
								paddingRight: semanticSpacing.stackLg,
							})}
						>
							<DispatchReport />
						</Item>
					) : (
						<>
							<Item
								size={'grow'}
								cssOverrides={css({
									maxWidth: '826px',
								})}
							>
								<PreviewToggle />
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
									<CreateNotificationForm activeSectionHref={selectedHref} />
								</div>
							</Item>
							<Item
								size={'grow'}
								cssOverrides={css({
									display: 'none',
									justifyContent: 'center',
									alignItems: 'flex-start',
									flow: 'vertical',
									['@media (min-width: 1280px)']: {
										display: 'flex',
									},
								})}
							>
								<EmailPreviewSection
									selectedSegments={parameters?.audienceSegments ?? []}
									selectedChannel={parameters?.type}
									selectedDeliveryTiming={
										parameters?.type === 'email'
											? parameters.emailDeliveryOption
											: undefined
									}
								/>
							</Item>
						</>
					)}
				</Grid>
			</Layout.Main>
		</>
	);
};
