import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';

const styles = {
	container: css({
		display: 'flex',
		alignItems: 'center',
		gap: semanticSpacing.stackXxs,
		padding: `${baseSpacing['2Px']} ${baseSpacing['6Px']}`,
		color: semanticColors.text.strongerInverse,
		backgroundColor: semanticColors.text.error,
		textTransform: 'uppercase',
	}),
	dot: css({
		width: '8px',
		height: '8px',
		borderRadius: '50%',
		backgroundColor: semanticColors.text.strongerInverse,
	}),
};

export const LiveIndicator = () => {
	return (
		<Typography
			variant="bodyBoldXs"
			element="span"
			cssOverrides={styles.container}
		>
			<span css={styles.dot} aria-hidden="true" />
			Live
		</Typography>
	);
};
