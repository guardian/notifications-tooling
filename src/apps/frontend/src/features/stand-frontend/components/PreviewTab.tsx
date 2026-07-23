import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { HTMLPreview } from './HTMLPreview';

const styles = {
	masterPreview: css({
		display: 'flex',
		width: '1073px',
		height: '442px',
		padding: 'spacing-16',
		flexDirection: 'column',
		alignItems: 'flex-start',
		gap: 'spacing-20',
		alignSelf: 'stretch',
	}),
	previewBox: css({
		width: '111px',
	}),
	routingCard: css({
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: '12px',
		padding: '16px',
		borderRadius: '8px',
		border: `1px solid ${semanticColors.border.weak}`,
		backgroundColor: semanticColors.bg.base,
	}),
};
interface PreviewTabProps {
	subject: string;
	previewText: string;
}

export function PreviewTab({ subject, previewText }: PreviewTabProps) {
	console.log('PreviewTab props:', { subject, previewText });
	return (
		<div css={styles.masterPreview}>
			<div css={styles.previewBox}>
				<Typography
					variant="titleMd"
					element="h3"
					color={semanticColors.text.strong}
				>
					Preview
				</Typography>
				<Typography
					variant="bodyMd"
					element="p"
					color={semanticColors.text.weak}
				>
					The preview for the newsletter email and/or the app alert notification
					will be shown below.
				</Typography>
				<div>
					<HTMLPreview />
				</div>
				<div css={styles.routingCard}>
					<Typography
						variant="titleMd"
						element="h6"
						color={semanticColors.text.strong}
					>
						Routing
					</Typography>
				</div>

				<div css={styles.routingCard}>
					<Typography
						variant="titleMd"
						element="h6"
						color={semanticColors.text.strong}
					>
						Audience segments
					</Typography>
				</div>
			</div>
		</div>
	);
}
