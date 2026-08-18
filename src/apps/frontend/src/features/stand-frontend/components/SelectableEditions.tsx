import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSpacing } from '@guardian/stand';
import { Checkbox } from '@guardian/stand/Checkbox';
import type { CheckboxTheme } from '@guardian/stand/Checkbox';
import { Grid, Item } from '@guardian/stand/Grid';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { audienceSegmentStyles, previewPillStyles } from '../themes';
import { type Edition } from '../types';
import { FlagAtom } from './FlagAtom';

export interface Segment {
	code: Edition;
	label: string;
}

interface SelectableEditionsPickerProps {
	title?: string;
	description?: string;
	segments?: Segment[];
	selected: Edition[];
	onChange: (selected: Edition[]) => void;
	error?: string;
}

export const DEFAULT_EDITIONS: Segment[] = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
	{ code: 'EU', label: 'EU' },
	{ code: 'INT', label: 'International' },
];

const customTheme: CheckboxTheme = {
	input: {
		shared: {
			indicator: {
				selected: {
					backgroundColor: baseColors.magenta[200],
				},
				check: {
					height: '18px',
					width: '24px',
				},
			},
		},
	},
};

export const SelectableEditions = ({
	title,
	description,
	segments = DEFAULT_EDITIONS,
	selected,
	onChange,
	error,
}: SelectableEditionsPickerProps) => {
	const onSegmentToggle = (segmentCode: Edition) => {
		const next = selected.includes(segmentCode)
			? selected.filter((code) => code !== segmentCode)
			: [...selected, segmentCode];
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
					sm: { gap: '12px', padding: `0px 0px 0px 0px` },
					md: { gap: '12px', padding: `0px 0px 0px 0px` },
					lg: { gap: '12px', padding: `0px 0px 0px 0px` },
				}}
			>
				{segments.map((segment) => {
					const isSelected = selected.includes(segment.code);
					return (
						<Item size={4} key={segment.code}>
							<div
								css={audienceSegmentStyles.audienceSegmentCheckBoxTile(
									isSelected,
								)}
							>
								<Checkbox
									theme={customTheme}
									size="sm"
									isSelected={isSelected}
									onChange={() => onSegmentToggle(segment.code)}
									aria-label={`Select ${segment.label} audience segment`}
									cssOverrides={css({
										width: '100%',
										flexDirection: 'row-reverse',
										justifyContent: 'space-between',
										alignItems: 'flex-start',
									})}
								>
									<div
										css={css({
											display: 'flex',
											flexDirection: 'column',
											gap: semanticSpacing.stackXs,
										})}
									>
										<div css={previewPillStyles.icon}>
											<FlagAtom segmentCode={segment.code} />
										</div>
										<Typography
											variant="headingXs"
											cssOverrides={css({
												color: semanticColors.text.strong,
												marginBottom: '0px',
												height: '24px',
											})}
										>
											{segment.label}
										</Typography>
									</div>
								</Checkbox>
							</div>
						</Item>
					);
				})}
			</Grid>

			{error && <InlineMessage level="error">{error}</InlineMessage>}
		</div>
	);
};
