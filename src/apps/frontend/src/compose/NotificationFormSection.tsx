import { css } from '@emotion/react';
import { baseColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import type { PropsWithChildren } from 'react';
import { topBarHeight } from '../themes';

export const NotificationFormSection = ({
	id,
	isActive,
	children,
}: PropsWithChildren<{ id: string; isActive: boolean }>) => (
	<section
		id={id}
		data-scrollspy-active={isActive ? '' : undefined}
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
