import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { previewPillStyles } from '../themes';

export interface PreviewPillOption<Id extends string = string> {
	id: Id;
	label: string;
}

interface PreviewPillListProps<Id extends string> {
	title: string;
	options: Array<PreviewPillOption<Id>>;
	selected: Id[];
	isConfirmation?: boolean;
	renderIcon?: (id: Id) => ReactNode;
}

export const PreviewPillList = <Id extends string>({
	title,
	options,
	selected,
	isConfirmation = false,
	renderIcon,
}: PreviewPillListProps<Id>) => {
	if (selected.length === 0) {
		return null;
	}

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			{!isConfirmation && <Typography variant="bodyBoldMd">{title}</Typography>}
			<div
				css={{
					display: 'flex',
					flexDirection: 'row',
					flexWrap: 'wrap',
					gap: semanticSpacing.stackXs,
				}}
			>
				{selected.map((id) => {
					const label = options.find((option) => option.id === id)?.label ?? id;
					const icon = renderIcon?.(id);
					return (
						<div
							key={id}
							css={
								isConfirmation
									? previewPillStyles.confirmationPill
									: previewPillStyles.pill
							}
						>
							{icon && <div css={previewPillStyles.icon}>{icon}</div>}
							<Typography
								variant="bodySm"
								cssOverrides={css({ color: semanticColors.text.strong })}
							>
								{label}
							</Typography>
						</div>
					);
				})}
			</div>
		</div>
	);
};
