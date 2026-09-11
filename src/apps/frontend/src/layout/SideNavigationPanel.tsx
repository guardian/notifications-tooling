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
import { useNavigate } from 'react-router-dom';
import { useActiveSectionHref } from '../hooks/useActiveSectionHref';
import { layer, topBarHeight } from '../themes';
import type { ChannelOption } from '../types';
import { ACTIVE_SECTION_VIEWPORT_POSITION } from './constants';

const getStep = (id: string, label: string): StepNavStep => ({
	id,
	label,
	canSkipFrom: true,
	canSkipTo: true,
});

const EMAIL_STEPS: StepNavStep[] = [
	getStep('#article-section', 'Article and channel'),
	getStep('#content-section', 'Kicker, subject and preview'),
	getStep('#audience-section', 'Audience'),
	getStep('#delivery-timing-section', 'Delivery and timing'),
	getStep('#send-button-section', 'Send'),
];

const PUSH_STEPS: StepNavStep[] = [
	getStep('#article-section', 'Article and channel'),
	getStep('#alert-section', 'Alert type and editions'),
	getStep('#content-section', 'Headline'),
	getStep('#delivery-timing-section', 'Delivery and timing'),
	getStep('#send-button-section', 'Send'),
];

const PANEL_ITEMS_BY_CHANNEL: Record<ChannelOption, StepNavStep[]> = {
	email: EMAIL_STEPS,
	push: PUSH_STEPS,
};

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
	channel?: ChannelOption;
}

export const SideNavigationPanel = ({
	channel = 'email',
}: SideNavigationPanelProps) => {
	const PANEL_ITEMS = PANEL_ITEMS_BY_CHANNEL[channel];

	const activeSectionHref = useActiveSectionHref();
	const navigate = useNavigate();
	const locationHashRef = useRef(activeSectionHref);
	const isClickLockedRef = useRef(false);

	useEffect(() => {
		locationHashRef.current = activeSectionHref;
	}, [activeSectionHref]);

	useEffect(() => {
		const sections = PANEL_ITEMS.flatMap((item) => {
			const element = document.getElementById(item.id.slice(1));
			return element ? [{ item, element }] : [];
		});
		let animationFrameId: number | undefined;

		const selectItem = (item: (typeof PANEL_ITEMS)[number]) => {
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

		const hasValidLocationHash = PANEL_ITEMS.some(
			({ id }) => id === window.location.hash,
		);
		if (!hasValidLocationHash) {
			updateActiveSection();
		}
		window.addEventListener('scroll', scheduleUpdate, { passive: true });
		window.addEventListener('resize', scheduleUpdate);

		return () => {
			window.removeEventListener('scroll', scheduleUpdate);
			window.removeEventListener('resize', scheduleUpdate);
			if (animationFrameId !== undefined) {
				window.cancelAnimationFrame(animationFrameId);
			}
		};
	}, [navigate, PANEL_ITEMS]);

	const handleTileClick = (href: string) => {
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
				currentStepId={activeSectionHref}
				stepNavConfig={{
					isNonLinear: true,
					steps: PANEL_ITEMS,
				}}
				onPress={handleTileClick}
				theme={theme}
				cssOverrides={sidebarNavigationCssOverrides}
			/>
		</div>
	);
};
