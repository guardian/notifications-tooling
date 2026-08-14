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
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ACTIVE_SECTION_VIEWPORT_POSITION } from '../constants';
import { layer, topBarHeight } from '../themes';

const SIDE_NAVIGATION_PANEL_ITEMS: StepNavStep[] = [
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
	onSelectedHrefChange: (href: string) => void;
}

export const SideNavigationPanel = ({
	selectedHref,
	onSelectedHrefChange,
}: SideNavigationPanelProps) => {
	const { hash } = useLocation();
	const navigate = useNavigate();
	const selectedHrefRef = useRef(DEFAULT_SIDE_NAV_HREF);
	const locationHashRef = useRef(hash);
	const isClickLockedRef = useRef(false);

	useEffect(() => {
		locationHashRef.current = hash;
	}, [hash]);

	const selectHref = (href: string) => {
		selectedHrefRef.current = href;
		onSelectedHrefChange(href);
	};

	useEffect(() => {
		const sections = SIDE_NAVIGATION_PANEL_ITEMS.flatMap((item) => {
			const element = document.getElementById(item.id.slice(1));
			return element ? [{ item, element }] : [];
		});
		let animationFrameId: number | undefined;

		const selectItem = (item: (typeof SIDE_NAVIGATION_PANEL_ITEMS)[number]) => {
			if (selectedHrefRef.current !== item.id) {
				selectedHrefRef.current = item.id;
				onSelectedHrefChange(item.id);
			}
			if (locationHashRef.current !== item.id) {
				locationHashRef.current = item.id;
				void navigate({ hash: item.id }, { replace: true });
			}
		};
		const updateActiveSection = () => {
			if (isClickLockedRef.current || sections.length === 0) {
				return;
			}

			if (window.scrollY === 0) {
				selectItem(sections[0]!.item);
				return;
			}

			const isAtPageBottom =
				window.innerHeight + window.scrollY >=
				document.documentElement.scrollHeight - 1;
			if (isAtPageBottom) {
				selectItem(sections.at(-1)?.item ?? sections[0]!.item);
				return;
			}

			const markerPosition =
				window.innerHeight * ACTIVE_SECTION_VIEWPORT_POSITION;
			const activeSection = sections.findLast(
				({ element }) => element.getBoundingClientRect().top <= markerPosition,
			);
			selectItem(activeSection?.item ?? sections[0]!.item);
		};
		const scheduleUpdate = () => {
			if (animationFrameId !== undefined) {
				return;
			}
			animationFrameId = window.requestAnimationFrame(() => {
				animationFrameId = undefined;
				updateActiveSection();
			});
		};

		updateActiveSection();
		window.addEventListener('scroll', scheduleUpdate, { passive: true });
		window.addEventListener('resize', scheduleUpdate);

		return () => {
			window.removeEventListener('scroll', scheduleUpdate);
			window.removeEventListener('resize', scheduleUpdate);
			if (animationFrameId !== undefined) {
				window.cancelAnimationFrame(animationFrameId);
			}
		};
	}, [navigate, onSelectedHrefChange]);

	const handleTileClick = (href: string) => {
		selectHref(href);
		if (locationHashRef.current !== href) {
			locationHashRef.current = href;
			void navigate({ hash: href });
		}

		isClickLockedRef.current = true;
		const unlockScrollUpdates = () => {
			isClickLockedRef.current = false;
			window.clearTimeout(unlockTimeoutId);
			window.removeEventListener('scrollend', unlockScrollUpdates);
		};
		window.addEventListener('scrollend', unlockScrollUpdates, { once: true });
		const unlockTimeoutId = window.setTimeout(unlockScrollUpdates, 1_000);
		const targetId = href.slice(1);
		document.getElementById(targetId)?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
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
				onPress={handleTileClick}
				theme={theme}
				cssOverrides={sidebarNavigationCssOverrides}
			/>
		</div>
	);
};
