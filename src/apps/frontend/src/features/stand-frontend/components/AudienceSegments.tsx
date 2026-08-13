import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSpacing } from '@guardian/stand';
import { Checkbox } from '@guardian/stand/Checkbox';
import type { CheckboxTheme } from '@guardian/stand/Checkbox';
import { Grid, Item } from '@guardian/stand/Grid';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { audienceSegmentStyles } from '../themes';
import { type AudienceSegment } from '../types';
import { FlagAtom } from './FlagAtom';

export interface Segment {
	code: AudienceSegment;
	label: string;
}

interface AudienceSegmentPickerProps {
	segments?: Segment[];
	selected: AudienceSegment[];
	onChange: (selected: AudienceSegment[]) => void;
	error?: string;
}

interface AudienceSegmentsPreviewPillProps {
	segments?: Segment[];
	selected: AudienceSegment[];
	isConfirmation?: boolean;
}

export const DEFAULT_SEGMENTS: Segment[] = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
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

export const AudienceSegments = ({
	segments = DEFAULT_SEGMENTS,
	selected,
	onChange,
	error,
}: AudienceSegmentPickerProps) => {
	const onSegmentToggle = (segmentCode: AudienceSegment) => {
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
			<Typography variant="bodyBoldMd">Audience segments</Typography>
			<Typography variant="bodyCompactSm">
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
										<div css={audienceSegmentStyles.audienceSegmentIcon}>
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

export const AudienceSegmentsPreviewPill = ({
	segments = DEFAULT_SEGMENTS,
	selected,
	isConfirmation = false,
}: AudienceSegmentsPreviewPillProps) => {
	return (
		<>
			{selected.length !== 0 && (
				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						gap: semanticSpacing.stackXs,
					}}
				>
					{!isConfirmation && (
						<Typography variant="bodyBoldMd">Audience segments</Typography>
					)}

					<div
						css={{
							display: 'flex',
							flexDirection: 'row',
							gap: semanticSpacing.stackXs,
						}}
					>
						{selected.map((segmentCode) => {
							const matchingSegment = segments.find(
								(segment) => segment.code === segmentCode,
							);
							const segmentLabel = matchingSegment?.label ?? segmentCode;
							return (
								<div
									key={segmentCode}
									css={
										isConfirmation
											? audienceSegmentStyles.isConfirmationStyle
											: audienceSegmentStyles.audienceSegmentButton
									}
								>
									<div css={audienceSegmentStyles.audienceSegmentIcon}>
										<FlagAtom segmentCode={segmentCode} />
									</div>
									<Typography
										variant="bodySm"
										cssOverrides={css({
											color: semanticColors.text.strong,
										})}
									>
										{segmentLabel}
									</Typography>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
};
