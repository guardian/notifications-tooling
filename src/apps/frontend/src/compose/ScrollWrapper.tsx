import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticRadius } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import type { ComponentProps, ReactNode } from 'react';

interface ScrollWrapperProps extends Omit<ComponentProps<'div'>, 'children'> {
	children: ReactNode;
	scrollbar?: 'visible' | 'hidden';
}

export const ScrollWrapper = ({
	children,
	scrollbar = 'visible',
	...props
}: ScrollWrapperProps) => {
	return (
		<div
			data-scrollbar={scrollbar}
			css={css({
				[from.lg]: {
					minHeight: 0,
					flex: 1,
					overflowY: 'scroll',
					scrollbarGutter: scrollbar === 'visible' ? 'stable' : undefined,
					scrollbarWidth: scrollbar === 'visible' ? 'thin' : 'none',
					scrollbarColor:
						scrollbar === 'visible'
							? `${semanticColors.border.strong} ${semanticColors.fill.weak}`
							: undefined,
					'&::-webkit-scrollbar': {
						display: scrollbar === 'hidden' ? 'none' : undefined,
						width: scrollbar === 'visible' ? baseSpacing['8Px'] : undefined,
					},
					'&::-webkit-scrollbar-track': {
						backgroundColor: semanticColors.fill.weak,
					},
					'&::-webkit-scrollbar-thumb': {
						borderRadius: semanticRadius.cornerSm,
						backgroundColor: semanticColors.border.strong,
					},
				},
			})}
			{...props}
		>
			{children}
		</div>
	);
};
