import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import type { PropsWithChildren } from 'react';
import { useActiveSectionHref } from '../hooks/useActiveSectionHref';
import { ACTIVE_SECTION_VIEWPORT_POSITION } from '../layout/constants';
import { stickyHeaderHeight } from '../themes';

export const jumpToFormSection = (sectionId: string) => {
	const section = document.getElementById(sectionId);
	if (!section) {
		return;
	}
	const sectionTop = section.getBoundingClientRect().top + window.scrollY;
	const targetTop =
		sectionId === 'article-section'
			? 0
			: Math.max(
					1,
					sectionTop -
						window.innerHeight * ACTIVE_SECTION_VIEWPORT_POSITION +
						1,
				);
	window.scrollTo({
		top: targetTop,
	});
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
