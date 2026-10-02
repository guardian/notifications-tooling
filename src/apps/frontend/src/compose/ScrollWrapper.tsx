import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticRadius } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import type { ComponentProps, ReactNode } from 'react';

interface ScrollWrapperProps extends Omit<ComponentProps<'div'>, 'children'> {
	children: ReactNode;
	reserveScrollbarSpace?: boolean;
}

export const ScrollWrapper = ({
	children,
	reserveScrollbarSpace = true,
	...props
}: ScrollWrapperProps) => {
	return (
		<div
			css={css({
				[from.lg]: {
					minHeight: 0,
					flex: 1,
					overflowY: reserveScrollbarSpace ? 'scroll' : 'auto',
					scrollbarGutter: reserveScrollbarSpace ? 'stable' : 'auto',
					scrollbarWidth: 'thin',
					scrollbarColor: `${semanticColors.border.strong} transparent`,
					'&::-webkit-scrollbar': {
						width: baseSpacing['8Px'],
					},
					'&::-webkit-scrollbar-track': {
						backgroundColor: 'transparent',
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
