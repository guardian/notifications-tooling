import type { SerializedStyles } from '@emotion/react';
import { css, keyframes } from '@emotion/react';
import { Icon } from '@guardian/stand/Icon';
import type { CSSProperties } from 'react';

interface Props {
	fontSize?: CSSProperties['fontSize'];
	color?: CSSProperties['color'];
}

const spin = keyframes({
	from: { transform: 'rotate(0deg)' },
	to: { transform: 'rotate(360deg)' },
});

const loadingIconStyle = (
	size: CSSProperties['fontSize'],
	color: CSSProperties['color'],
): SerializedStyles => {
	return css({
		fontSize: size,
		color,
		animation: `${spin} 1s linear infinite`,
	});
};

export const LoadingSpinner = ({
	fontSize = undefined,
	color = undefined,
}: Props) => {
	return (
		<Icon css={loadingIconStyle(fontSize, color)} symbol="progress_activity" />
	);
};
