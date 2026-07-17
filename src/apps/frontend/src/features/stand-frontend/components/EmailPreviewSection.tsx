import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';

/**
 * This is a non-functional placeholder to demonstrate how content will appear in the layout
 */
export const EmailPreviewSection = () => {
	return (
		<section
			css={css({
				background: semanticColors.fill.neutralWeak,
				flexBasis: 474,
				padding: baseSpacing['16Px'],
				display: 'flex',
				flexDirection: 'column',
				gap: baseSpacing['20Px'],
			})}
		>
			<header>
				<div
					css={{
						display: 'flex',
						alignItems: 'center',
						gap: 5,
					}}
				>
					<Icon symbol="preview" />
					<Typography variant="headingCompactLg">Preview</Typography>
				</div>
				<Typography variant="bodySm">
					The preview for the newsletter email and/or the app alert notification
					will be shown below.
				</Typography>
			</header>
		</section>
	);
};
