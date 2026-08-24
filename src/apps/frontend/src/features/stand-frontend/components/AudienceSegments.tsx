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
import { audienceSegmentNameMap } from '../option-values';
import { audienceSegmentStyles, previewPillStyles } from '../themes';
import { FlagAtom } from './FlagAtom';
import { PreviewPillList } from './PreviewPillList';

export interface Segment {
	id: string;
	label: string;
}

interface AudienceSegmentPickerProps {
	segments: Segment[];
	selected: string[];
	onChange: (selected: string[]) => void;
	error?: string;
}

interface AudienceSegmentsPreviewPillProps {
	segments: Segment[];
	selected: string[];
	isConfirmation?: boolean;
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

export const AudienceSegments = ({
	segments,
	selected,
	onChange,
	error,
}: AudienceSegmentPickerProps) => {
	const onSegmentToggle = (segmentCode: string) => {
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
			<Typography variant="labelFormMd">Audience segments</Typography>
			<Typography
				variant="helpTextFormMd"
				cssOverrides={css({ color: semanticColors.text.weak })}
			>
				Choose the audience the email notification will be sent to
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
					const isSelected = selected.includes(segment.id);
					return (
						<Item size={4} key={segment.id}>
							<div
								css={audienceSegmentStyles.audienceSegmentCheckBoxTile(
									isSelected,
								)}
							>
								<Checkbox
									theme={customTheme}
									size="sm"
									isSelected={isSelected}
									onChange={() => onSegmentToggle(segment.id)}
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
											<FlagAtom segmentCode={segment.id} />
										</div>
										<Typography
											variant="headingXs"
											cssOverrides={css({
												color: semanticColors.text.strong,
												marginBottom: '0px',
												height: '24px',
											})}
										>
											{audienceSegmentNameMap[segment.id] ?? segment.label}
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

export const AudienceSegmentsPreviewPill = ({
	segments,
	selected,
	isConfirmation = false,
}: AudienceSegmentsPreviewPillProps) => (
	<PreviewPillList
		title="Audience segments"
		options={segments}
		selected={selected}
		isConfirmation={isConfirmation}
		renderIcon={(segmentCode) => <FlagAtom segmentCode={segmentCode} />}
	/>
);
