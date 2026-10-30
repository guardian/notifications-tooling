import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { getPillarBackgroundColor } from '../utils/pillar-colors';

interface Props {
	pillarId?: string;
}

const styles = {
	container: (pillarColor: string) =>
		css({
			display: 'flex',
			alignItems: 'center',
			gap: semanticSpacing.stackXxs,
			padding: `${baseSpacing['2Px']} ${baseSpacing['6Px']}`,
			color: semanticColors.text.strongerInverse,
			backgroundColor: pillarColor,
			textTransform: 'uppercase',
		}),
	dot: css({
		width: '8px',
		height: '8px',
		borderRadius: '50%',
		backgroundColor: semanticColors.text.strongerInverse,
	}),
};

export const LiveIndicator = ({ pillarId }: Props) => {
	const pillarColor = getPillarBackgroundColor(pillarId);
	return (
		<Typography
			variant="bodyBoldXs"
			element="span"
			cssOverrides={styles.container(pillarColor)}
		>
			<span css={styles.dot} aria-hidden="true" />
			Live
		</Typography>
	);
};
