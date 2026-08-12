import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { from } from '@guardian/stand/utils';
import { useContext, useEffect, useRef, useState } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { layoutMainTheme } from '../themes';
import type { ActiveSection } from '../types';
import { CreateNotificationForm } from './CreateNotificationForm';
import { DispatchReport } from './DispatchReport';
import { EmailPreviewSection } from './EmailPreviewSection';
import { PreviewToggle } from './PreviewToggle';
import { ScrollWrapper } from './ScrollWrapper';
import {
	DEFAULT_SIDE_NAV_HREF,
	SIDE_NAVIGATION_PANEL_ITEMS,
	SideNavigationPanel,
} from './SideNavigationPanel';

export const DispatchTab = () => {
	const {
		notification: { sendingResult, parameters },
		updateNotification,
	} = useContext(NotificationFormContext);

	const [selectedHref, setSelectedHref] = useState(DEFAULT_SIDE_NAV_HREF);
	const isClickLockedRef = useRef(false);

	useEffect(() => {
		if (sendingResult) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.getAttribute('id');
					if (entry.isIntersecting && id && !isClickLockedRef.current) {
						const href = `#${id}`;
						if (SIDE_NAVIGATION_PANEL_ITEMS.some((item) => item.id === href)) {
							setSelectedHref(href);
							updateNotification({
								type: 'set-active-section',
								text: href as ActiveSection,
							});
						}
					}
				});
			},
			{ rootMargin: '-8% 0px -8% 0px' },
		);

		SIDE_NAVIGATION_PANEL_ITEMS.forEach((item) => {
			// item.id is e.g. '#article-section'; strip the leading '#' for getElementById
			const el = document.getElementById(item.id.slice(1));
			if (el) {
				observer.observe(el);
			}
		});

		return () => observer.disconnect();
	}, [sendingResult, updateNotification]);

	return (
		<>
			<Layout.Sidebar layoutSmBreakpoint="above-grid">
				<SideNavigationPanel
					selectedHref={selectedHref}
					setSelectedHref={setSelectedHref}
					isClickLockedRef={isClickLockedRef}
				/>
			</Layout.Sidebar>
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
								<ScrollWrapper
									style={css({
										paddingLeft: semanticSpacing.stackMd,
										[from.md]: { paddingLeft: semanticSpacing.stackXl },
										'@media (min-width: 1500px)': {
											paddingLeft: '147px',
										},
									})}
								>
									<CreateNotificationForm />
								</ScrollWrapper>
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
