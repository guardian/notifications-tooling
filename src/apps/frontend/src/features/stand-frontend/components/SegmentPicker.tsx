import { css } from '@emotion/react';
import {
	baseColors,
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import type { CheckboxTheme } from '@guardian/stand/Checkbox';
import { Checkbox } from '@guardian/stand/Checkbox';
import { Grid, Item } from '@guardian/stand/Grid';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { audienceSegmentStyles, previewPillStyles } from '../themes';
import type { AudienceSegment, Edition } from '../types';
import { FlagAtom } from './FlagAtom';

export interface SegmentOption<Code extends AudienceSegment | Edition> {
	code: Code;
	label: string;
}

interface SegmentPickerProps<Code extends AudienceSegment | Edition> {
	title?: string;
	description?: string;
	options: Array<SegmentOption<Code>>;
	selected: Code[];
	onChange: (selected: Code[]) => void;
	error?: string;
}

const customTheme: CheckboxTheme = {
	input: {
		shared: {
			indicator: {
				selected: {
					backgroundColor: baseColors.magenta[200],
					border: `${semanticSizing.border.default} solid ${baseColors.magenta[200]}`,
				},
				check: {
					height: '18px',
					width: '24px',
				},
			},
		},
	},
};

export const SegmentPicker = <Code extends AudienceSegment | Edition>({
	title,
	description,
	options,
	selected,
	onChange,
	error,
}: SegmentPickerProps<Code>) => {
	const onToggle = (code: Code) => {
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
					sm: { gap: '12px', padding: `0px 0px 0px 0px` },
					md: { gap: '12px', padding: `0px 0px 0px 0px` },
					lg: { gap: '12px', padding: `0px 0px 0px 0px` },
				}}
			>
				{options.map((option) => {
					const isSelected = selected.includes(option.code);
					return (
						<Item size={4} key={option.code}>
							<div
								css={audienceSegmentStyles.audienceSegmentCheckBoxTile(
									isSelected,
								)}
							>
								<Checkbox
									theme={customTheme}
									size="sm"
									isSelected={isSelected}
									onChange={() => onToggle(option.code)}
									aria-label={`Select ${option.label}`}
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
											<FlagAtom segmentCode={option.code} />
										</div>
										<Typography
											variant="headingXs"
											cssOverrides={css({
												color: semanticColors.text.strong,
												marginBottom: '0px',
												height: '24px',
											})}
										>
											{option.label}
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
