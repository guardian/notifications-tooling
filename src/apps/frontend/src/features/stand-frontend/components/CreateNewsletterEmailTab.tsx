import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
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
import {
	DEFAULT_SIDE_NAV_HREF,
	SIDE_NAVIGATION_PANEL_ITEMS,
	SideNavigationPanel,
} from './SideNavigationPanel';

const ACTIVE_SECTION_VIEWPORT_POSITION = 0.75;

export const CreateNewsletterEmailTab = () => {
	const {
		notification: { sendingResult, parameters },
		updateNotification,
	} = useContext(NotificationFormContext);

	const [selectedHref, setSelectedHref] = useState(DEFAULT_SIDE_NAV_HREF);
	const activeHrefRef = useRef(DEFAULT_SIDE_NAV_HREF);
	const isClickLockedRef = useRef(false);
	const setActiveHref = (href: string) => {
		activeHrefRef.current = href;
		setSelectedHref(href);
	};

	useEffect(() => {
		if (sendingResult) {
			return;
		}

		const getSections = () =>
			SIDE_NAVIGATION_PANEL_ITEMS.flatMap((item) => {
				const element = document.getElementById(item.id.slice(1));
				return element ? [{ item, element }] : [];
			});
		const isAtPageBottom = () =>
			window.scrollY > 0 &&
			window.innerHeight + window.scrollY >=
			document.documentElement.scrollHeight - 1;
		const setActiveItem = (item: (typeof SIDE_NAVIGATION_PANEL_ITEMS)[number]) => {
			if (activeHrefRef.current === item.id) {
				return;
			}

			setActiveHref(item.id);
			updateNotification({
				type: 'set-active-section',
				text: item.id as ActiveSection,
			});
			window.history.replaceState(window.history.state, '', item.id);
		};
		const updateActiveSection = () => {
			const sections = getSections();
			if (isClickLockedRef.current || sections.length === 0) {
				return;
			}

			if (window.scrollY === 0) {
				setActiveItem(sections[0]!.item);
				return;
			}

			if (isAtPageBottom()) {
				setActiveItem(sections.at(-1)?.item ?? sections[0]!.item);
				return;
			}

			const markerPosition = window.innerHeight * ACTIVE_SECTION_VIEWPORT_POSITION;
			const activeSection = sections.findLast(
				({ element }) => element.getBoundingClientRect().top <= markerPosition,
			);
			setActiveItem(activeSection?.item ?? sections[0]!.item);
		};

		updateActiveSection();
		window.addEventListener('scroll', updateActiveSection, { passive: true });
		window.addEventListener('resize', updateActiveSection);

		return () => {
			window.removeEventListener('scroll', updateActiveSection);
			window.removeEventListener('resize', updateActiveSection);
		};
	}, [sendingResult, updateNotification]);

	return (
		<>
			{!sendingResult?.ok && (
				<Layout.Sidebar layoutSmBreakpoint="above-grid">
					<SideNavigationPanel
						selectedHref={selectedHref}
						setSelectedHref={setActiveHref}
						isClickLockedRef={isClickLockedRef}
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
									<CreateNotificationForm />
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
