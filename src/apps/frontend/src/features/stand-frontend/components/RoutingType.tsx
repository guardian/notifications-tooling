import { Typography } from '@guardian/stand/Typography';
import { baseColors, semanticColors, semanticSizing, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';

const styles = {
	newsletterTile: {
		borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
		width: '450px',
		height: '74px',
		backgroundColor: baseColors.neutral['900'],
		display: 'flex',
		flexDirection: 'column',
		gap: semanticSpacing.stackXs,
	},
	iconRow: {
		display: 'flex',
		flexDirection: 'row',
		padding: '8px 8px 8px 12px',
		gap: semanticSpacing.stackXs,
		alignItems: 'center',
	},
	emailIcon: {
		width: '20px',
		height: '20px',
		gap: '10px',
	},
	newsletterTitle: {
		gap: '10px',
	},
};




export const RoutingType = () => {
	return (
		<>
			<Typography variant="bodyBoldMd">Routing</Typography>
			<div css={styles.newsletterTile}>
				<div css={styles.iconRow}>
					<Icon size="md" symbol="email" alt="Newsletter email" />
					<Typography variant="headingCompactSm" css={styles.newsletterTitle}>
						Newsletter email
					</Typography>
				</div>
				<Typography
					variant="bodySm"
					css={{
						color: semanticColors.text.weak,
						padding: `0px ${semanticSpacing.stackSm} 12px ${semanticSpacing.stackSm}`,
					}}
				>
					Immediate send via Braze
				</Typography>
			</div>
		</>
	);
};
