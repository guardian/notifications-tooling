import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import type { PropsWithChildren } from 'react';
import { useActiveSectionHref } from '../hooks/useActiveSectionHref';
import { FORM_SECTION_JUMP_EVENT } from '../layout/constants';
import { stickyHeaderHeight } from '../themes';

export const jumpToFormSection = (sectionId: string) => {
	const section = document.getElementById(sectionId);
	if (!section) {
		return;
	}
	const firstControl = section.querySelector<HTMLElement>(
		'input:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
	);
	firstControl?.focus({ preventScroll: true });
	window.dispatchEvent(new Event(FORM_SECTION_JUMP_EVENT));
	section.scrollIntoView({ block: 'start' });
	window.history.replaceState(window.history.state, '', `#${sectionId}`);
	window.dispatchEvent(new PopStateEvent('popstate'));
};

export const NotificationFormSection = ({
	id,
	children,
}: PropsWithChildren<{ id: string }>) => {
	const activeSectionHref = useActiveSectionHref();

	return (
		<section
			id={id}
			data-scrollspy-active={activeSectionHref === `#${id}` ? '' : undefined}
			css={css({
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackMd,
				borderLeft: `${semanticSizing.border.md} solid transparent`,
				paddingLeft: semanticSpacing.stackMd,
				scrollMarginTop: stickyHeaderHeight,
				'&[data-scrollspy-active]': {
					borderLeftColor: baseColors.magenta[200],
				},
			})}
		>
			{children}
		</section>
	);
};
