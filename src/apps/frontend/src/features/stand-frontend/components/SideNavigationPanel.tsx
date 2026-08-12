import { css } from '@emotion/react';
import {
	baseColors,
	baseSpacing,
	semanticColors,
	semanticSizing,
} from '@guardian/stand';
import { SidebarStepperNavigation } from '@guardian/stand/SidebarStepperNavigation';
import type { SidebarStepperNavigationTheme } from '@guardian/stand/SidebarStepperNavigation';
import type { StepNavStep } from '@guardian/stand/SidebarStepperNavigation';
import { useContext } from 'react';
import type { MutableRefObject } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { layer, topBarHeight } from '../themes';
import type { ActiveSection } from '../types';

export const SIDE_NAVIGATION_PANEL_ITEMS: StepNavStep[] = [
	{
		id: '#article-section',
		label: 'Article and channel',
		canSkipFrom: true,
		canSkipTo: true,
	},
	{
		id: '#content-section',
		label: 'Content',
		canSkipFrom: true,
		canSkipTo: true,
	},
	{
		id: '#audience-section',
		label: 'Audience',
		canSkipFrom: true,
		canSkipTo: true,
	},
	{
		id: '#delivery-timing-section',
		label: 'Timing and delivery',
		canSkipFrom: true,
		canSkipTo: true,
	},
	{
		id: '#send-button-section',
		label: 'Send',
		canSkipFrom: true,
		canSkipTo: true,
	},
];

export const DEFAULT_SIDE_NAV_HREF =
	SIDE_NAVIGATION_PANEL_ITEMS[0]?.id ?? '#article-section';

const theme: SidebarStepperNavigationTheme = {
	navigation: {
		shared: {
			border: 'none',
		},
	},
	step: {
		shared: {
			height: '72px',
		},
	},
	stepNumber: {
		shared: {
			backgroundColor: baseColors.magenta[200],
		},
	},
	stepContent: {
		shared: {
			marginLeft: '0px',
			gap: `${baseSpacing['4Px']}px`,
		},
	},
};

const sidebarNavigationCssOverrides = css({
	'li > button > div:nth-of-type(2)': {
		borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		paddingLeft: baseSpacing['16Px'],
	},
});

interface SideNavigationPanelProps {
	selectedHref: string;
	setSelectedHref: (href: string) => void;
	isClickLockedRef?: MutableRefObject<boolean>;
}

export const SideNavigationPanel = ({
	selectedHref,
	setSelectedHref,
	isClickLockedRef,
}: SideNavigationPanelProps) => {
	const { updateNotification } = useContext(NotificationFormContext);

	const handleTileClick = (href: string) => {
		setSelectedHref(href);
		if (isClickLockedRef) {
			isClickLockedRef.current = true;
			const targetId = href.replace('#', '');
			document.getElementById(targetId)?.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});

			// Unlock scroll updates after anchor navigation settles
			window.setTimeout(() => {
				isClickLockedRef.current = false;
			}, 500);
		}
	};

	return (
		<div
			css={css({
				position: 'sticky',
				top: topBarHeight,
				zIndex: layer.stickyContent,
			})}
		>
			<SidebarStepperNavigation
				stepNavTitle={'Dispatch'}
				currentStepId={selectedHref}
				stepNavConfig={{
					isNonLinear: true,
					steps: SIDE_NAVIGATION_PANEL_ITEMS,
				}}
				onPress={(stepId) => {
					handleTileClick(stepId);
					updateNotification({
						type: 'set-active-section',
						text: stepId as ActiveSection,
					});
				}}
				theme={theme}
				cssOverrides={sidebarNavigationCssOverrides}
			/>
		</div>
	);
};
