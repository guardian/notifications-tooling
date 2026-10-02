import type { Interpolation, Theme } from '@emotion/react';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { ElementType, ReactNode } from 'react';
import { useId, useState } from 'react';

type CollapsibleSectionStyles =
	Interpolation<Theme> | ((isExpanded: boolean) => Interpolation<Theme>);

interface CollapsibleSectionProps {
	label: string;
	children: ReactNode;
	containerStyles?: CollapsibleSectionStyles;
	toggleStyles?: CollapsibleSectionStyles;
	contentStyles?: CollapsibleSectionStyles;
	contentId?: string;
	contentAs?: ElementType;
	contentAriaLabel?: string;
	keepMounted?: boolean;
}

const resolveStyles = (
	styles: CollapsibleSectionStyles | undefined,
	isExpanded: boolean,
) => (typeof styles === 'function' ? styles(isExpanded) : styles);

export const CollapsibleSection = ({
	label,
	children,
	containerStyles,
	toggleStyles,
	contentStyles,
	contentId,
	contentAs: Content = 'div',
	contentAriaLabel,
	keepMounted = false,
}: CollapsibleSectionProps) => {
	const generatedContentId = useId();
	const resolvedContentId = contentId ?? generatedContentId;
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div css={resolveStyles(containerStyles, isExpanded)}>
			<button
				type="button"
				aria-controls={resolvedContentId}
				aria-expanded={isExpanded}
				onClick={() => setIsExpanded((expanded) => !expanded)}
				css={resolveStyles(toggleStyles, isExpanded)}
			>
				<Typography variant="bodyBoldMd">{label}</Typography>
				<Icon
					symbol={isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
				/>
			</button>
			{(keepMounted || isExpanded) && (
				<Content
					id={resolvedContentId}
					aria-label={contentAriaLabel}
					css={resolveStyles(contentStyles, isExpanded)}
				>
					{children}
				</Content>
			)}
		</div>
	);
};
