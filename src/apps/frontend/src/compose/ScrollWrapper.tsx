import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticRadius } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import type { ComponentProps, ReactNode } from 'react';

interface ScrollWrapperProps extends Omit<ComponentProps<'div'>, 'children'> {
	children: ReactNode;
}

export const ScrollWrapper = ({ children, ...props }: ScrollWrapperProps) => {
	return (
		<div
			css={css({
				[from.lg]: {
					minHeight: 0,
					flex: 1,
					overflowY: 'scroll',
					scrollbarGutter: 'stable',
					scrollbarWidth: 'thin',
					scrollbarColor: `${semanticColors.border.strong} ${semanticColors.fill.weak}`,
					'&::-webkit-scrollbar': {
						width: baseSpacing['8Px'],
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
