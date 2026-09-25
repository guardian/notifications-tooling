import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Typography } from '@guardian/stand/Typography';
import { alertBannerCss } from '../themes';

export const ReviewWarning = () => {
	return (
		<section
			css={css({
				maxWidth: '458px',
				borderLeft: `${semanticSizing.border.md} solid transparent`,
				paddingLeft: semanticSpacing.stackMd,
			})}
		>
			<AlertBanner
				level="information"
				showIcon
				cssOverrides={alertBannerCss}
				theme={{
					shared: {
						content: {
							alignItems: 'flex-start',
						},
					},
					information: {
						icon: { color: semanticColors.text.blue },
					},
				}}
			>
				<div
					css={css({
						display: 'flex',
						flexDirection: 'column',
					})}
				>
					<Typography
						variant="bodyBoldSm"
						cssOverrides={css({
							color: semanticColors.text.blue,
							fontSize: '14px',
						})}
					>
						Review the content before sending
					</Typography>
					<Typography
						variant="bodySm"
						cssOverrides={css({
							color: semanticColors.text.strong,
							fontSize: '14px',
						})}
					>
						Character limits, audiences, and alert types / kicker differ between
						newsletter emails and app alerts. Please review the fields and
						ensure everything looks correct.
					</Typography>
				</div>
			</AlertBanner>
		</section>
	);
};
