import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { useContext, useEffect, useState } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { layoutMainTheme } from '../themes';
import { CreateNotificationForm } from './CreateNotificationForm';
import { DispatchReport } from './DispatchReport';
import { EmailPreviewSection } from './EmailPreviewSection';
import { ScrollWrapper } from './ScrollWrapper';
import {
	DEFAULT_SIDE_NAV_HREF,
	SIDE_NAVIGATION_PANEL_ITEMS,
	SideNavigationPanel,
} from './SideNavigationPanel';

const getActiveSideNavHref = (): string => {
	if (typeof window === 'undefined') {
		return DEFAULT_SIDE_NAV_HREF;
	}
	let activeHref = DEFAULT_SIDE_NAV_HREF;

	for (const item of SIDE_NAVIGATION_PANEL_ITEMS) {
		const section = document.getElementById(item.trackedSectionId);
		if (!section) {
			continue;
		}

		const activationOffset = Math.min(20, window.innerHeight * 0.2);
		const triggerLine = window.innerHeight - activationOffset;

		const { top } = section.getBoundingClientRect();
		if (top <= triggerLine) {
			activeHref = item.href;
		}
	}
	return activeHref;
};

export const DispatchTab = () => {
	const {
		notification: { sendingResult, parameters },
	} = useContext(NotificationFormContext);

	const [selectedHref, setSelectedHref] = useState(DEFAULT_SIDE_NAV_HREF);

	useEffect(() => {
		if (sendingResult) {
			return;
		}

		const updateSelectedHref = () => {
			setSelectedHref((currentHref) => {
				const nextHref = getActiveSideNavHref();
				return nextHref === currentHref ? currentHref : nextHref;
			});
		};

		updateSelectedHref();
		window.addEventListener('scroll', updateSelectedHref, { passive: true });
		window.addEventListener('resize', updateSelectedHref);

		return () => {
			window.removeEventListener('scroll', updateSelectedHref);
			window.removeEventListener('resize', updateSelectedHref);
		};
	}, [sendingResult]);

	return (
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
				{sendingResult ? (
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
							size={'auto'}
							cssOverrides={css({
								border: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
								gap: `${baseSpacing['10Px']}`,
							})}
						>
							<SideNavigationPanel
								selectedHref={selectedHref}
								onSelectedHrefChange={setSelectedHref}
							/>
						</Item>
						<Item
							size={'auto'}
							cssOverrides={css({
								borderRightWidth: semanticSizing.border.default,
								borderRightStyle: 'solid',
								borderRightColor: semanticColors.border.weak,
							})}
						>
							<ScrollWrapper>
								<CreateNotificationForm />
							</ScrollWrapper>
						</Item>
						<Item
							size={'auto'}
							cssOverrides={css({
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'flex-start',
								flow: 'vertical',
								width: '621px',
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
	);
};
