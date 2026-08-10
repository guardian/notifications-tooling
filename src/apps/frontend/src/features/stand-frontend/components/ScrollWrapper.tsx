import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type { CSSProperties } from 'react';
import type React from 'react';

interface ScrollWrapperProps {
	style?: SerializedStyles;
	height?: CSSProperties['height'];
	innerProps?: React.ComponentProps<'div'> & Record<`data-${string}`, string>;
	children?: React.ReactNode;
}

const scrollStyle = (height?: CSSProperties['height']) => css`
	overflow-y: auto;
	height: ${height ?? '100%'};
	position: relative;
	display: flex;
`;

export const ScrollWrapper: React.FunctionComponent<ScrollWrapperProps> = ({
	children,
	style,
	height,
	innerProps,
}) => {
	return (
		<div css={[scrollStyle(height), style]} {...innerProps}>
			{children}
		</div>
	);
};
