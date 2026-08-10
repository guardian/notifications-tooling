import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { baseSpacing } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { useContext, useEffect, useRef, useState } from 'react';
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

export const DispatchTab = () => {
	const {
		notification: { sendingResult, parameters },
	} = useContext(NotificationFormContext);

	const [selectedHref, setSelectedHref] = useState(DEFAULT_SIDE_NAV_HREF);
	const isClickLockedRef = useRef(false);

	const handleTileClick = (href: string) => {
		setSelectedHref(href);
		isClickLockedRef.current = true;

		// Unlock scroll updates after anchor navigation settles
		window.setTimeout(() => {
			isClickLockedRef.current = false;
		}, 500);
	};

	useEffect(() => {
		if (sendingResult) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.getAttribute('id');
					if (entry.isIntersecting && id && !isClickLockedRef.current) {
						const selectedHref = `#${id}`;
						if (
							SIDE_NAVIGATION_PANEL_ITEMS.some(
								(item) => item.href === selectedHref,
							)
						) {
							setSelectedHref(selectedHref);
						}
					}
				});
			},
			{ rootMargin: '-30% 0px -8% 0px' },
		);

		SIDE_NAVIGATION_PANEL_ITEMS.forEach((item) => {
			const el = document.getElementById(item.trackedSectionId);
			if (el) {
				observer.observe(el);
			}
		});

		return () => observer.disconnect();
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
							size={'auto'}
							cssOverrides={css({
								border: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
								gap: `${baseSpacing['10Px']}`,
							})}
						>
							<SideNavigationPanel
								selectedHref={selectedHref}
								onSelectedHrefChange={handleTileClick}
							/>
						</Item>
						<Item
							size={'grow'}
							cssOverrides={css({
								paddingLeft: '9rem',
								maxWidth: '826px'
							})}
						>
							<ScrollWrapper>
								<CreateNotificationForm />
							</ScrollWrapper>
						</Item>
						<Item
							size={'grow'}
							cssOverrides={css({
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'flex-start',
								flow: 'vertical',
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
