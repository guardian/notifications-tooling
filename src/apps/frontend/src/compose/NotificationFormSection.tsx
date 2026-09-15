import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import type { PropsWithChildren } from 'react';
import { useActiveSectionHref } from '../hooks/useActiveSectionHref';
import { topBarHeight } from '../themes';

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
				scrollMarginTop: topBarHeight,
				'&[data-scrollspy-active]': {
					borderLeftColor: baseColors.magenta[200],
				},
			})}
		>
			{children}
		</section>
	);
};
