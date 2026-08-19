import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';

export interface TextLinkButtonProps {
	text: string;
	textVariant?:
		'bodySm' | 'bodyMd' | 'bodyLg' | 'headingSm' | 'headingMd' | 'headingLg';
	textColor?: string;
	onClick?: () => void;
}
export const TextLinkButton = ({
	text,
	textVariant,
	textColor,
	onClick,
}: TextLinkButtonProps) => {
	return (
		<Typography
			variant={textVariant ?? 'bodyMd'}
			element="span"
			onClick={onClick}
			css={css({
				color: textColor ?? `${semanticColors.fill.link}`,
				textDecoration: 'underline',
			})}
		>
			{text}
		</Typography>
	);
};
