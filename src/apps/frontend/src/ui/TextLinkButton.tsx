import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';

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
		<>
			<Button
				type="button"
				onClick={onClick}
				variant="tertiary"
				aria-label={text}
				cssOverrides={css({
					border: 'none',
					backgroundColor: 'transparent',
					color: textColor ?? `${semanticColors.fill.link}`,
					textDecoration: 'underline',
					textStyle: textVariant ?? 'bodyMd',
					fontWeight: 'normal',
					fontSize: '14px',
					'&:hover': {
						color: textColor ?? `${semanticColors.fill.link}`,
						border: 'none',
						backgroundColor: 'transparent',
					},
				})}
			>
				{text}
			</Button>
		</>
	);
};
