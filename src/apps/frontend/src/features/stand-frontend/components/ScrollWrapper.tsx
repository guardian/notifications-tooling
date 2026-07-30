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

const outerStyle = (height?: CSSProperties['height']) => css`
	overflow-y: hidden;
	height: ${height ?? '100%'};
	position: relative;
`;

const innerStyle = css`
	overflow-y: auto;
	height: 100%;
	position: relative;
`;

export const ScrollWrapper: React.FunctionComponent<ScrollWrapperProps> = ({
	children,
	style,
	height,
	innerProps,
}) => {
	return (
		<div css={[outerStyle(height), style]}>
			<div css={innerStyle} {...innerProps}>
				{children}
			</div>
		</div>
	);
};
