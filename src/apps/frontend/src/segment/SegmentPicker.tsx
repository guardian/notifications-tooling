import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Tile } from '@guardian/stand/Tile';
import { Typography } from '@guardian/stand/Typography';
import type {
	DisplayAppAlertTopicEditionId,
	NewsletterSegmentId,
} from '@models';
import { audienceSegmentTileTheme } from '../themes';
import { FlagAtom } from '../ui/FlagAtom';

export interface SegmentOption<
	Code extends NewsletterSegmentId | DisplayAppAlertTopicEditionId,
> {
	code: Code;
	label: string;
}

interface SegmentPickerProps<
	Code extends NewsletterSegmentId | DisplayAppAlertTopicEditionId,
> {
	title?: string;
	description?: string;
	options: Array<SegmentOption<Code>>;
	selected: Code[];
	onChange: (selected: Code[]) => void;
	error?: string;
}

export const SegmentPicker = <
	Code extends NewsletterSegmentId | DisplayAppAlertTopicEditionId,
>({
	title,
	description,
	options,
	selected,
	onChange,
	error,
}: SegmentPickerProps<Code>) => {
	const handleToggle = (code: Code) => {
		const next = selected.includes(code)
			? selected.filter((selectedCode) => selectedCode !== code)
			: [...selected, code];
		onChange(next);
	};

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="labelFormMd">{title}</Typography>
			<Typography
				variant="helpTextFormMd"
				cssOverrides={css({ color: semanticColors.text.weak })}
			>
				{description}
			</Typography>

			<Grid
				cssOverrides={css({
					height: '100%',
					maxWidth: '450px',
				})}
				theme={{
					sm: { gap: '12px', padding: '0px' },
					md: { gap: '12px', padding: '0px' },
					lg: { gap: '12px', padding: '0px' },
				}}
			>
				{options.map((option) => {
					const isSelected = selected.includes(option.code);
					return (
						<Item size={4} key={option.code}>
							<Tile
								size="xs"
								icon={<FlagAtom segmentCode={option.code} />}
								value={option.code}
								interactionMode="multi-select"
								isSelected={isSelected}
								onSelectionChange={() => handleToggle(option.code)}
								aria-label={`Select ${option.label}`}
								description={option.label}
								descriptionTypography="headingXs"
								theme={audienceSegmentTileTheme}
							></Tile>
						</Item>
					);
				})}
			</Grid>

			{error && <InlineMessage level="error">{error}</InlineMessage>}
		</div>
	);
};
