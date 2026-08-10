import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Grid, Item } from '@guardian/stand/Grid';
import { Icon } from '@guardian/stand/Icon';
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
			<Typography variant="bodyBoldMd" id="audience-section">
				Audience Segments
			</Typography>
			<Typography variant="bodyCompactSm">
				Choose the audience the email notification will be sent to
			</Typography>

			<Grid>
				{segments.map((segment) => {
					const isSelected = selected.includes(segment.code);
					return (
						<Item size={4} key={segment.code}>
							<Button
								key={segment.code}
								variant="tertiary"
								onClick={() => onSegmentToggle(segment.code)}
								aria-pressed={isSelected}
								cssOverrides={audienceSegmentStyles.audienceSegmentCheckBoxTile(
									isSelected,
								)}
							>
								<div
									css={css({
										display: 'flex',
										flexDirection: 'column',
									})}
								>
									<div
										css={css({
											display: 'flex',
											flexDirection: 'row',
											paddingTop: `${baseSpacing['6Px']}`,
										})}
									>
										<div css={audienceSegmentStyles.audienceSegmentIcon}>
											<FlagAtom segmentCode={segment.code} />
										</div>
										<div
											css={css({
												height: '16px',
												width: '16px',
												alignItems: 'center',
												justifyContent: 'left',
											})}
										>
											<Icon
												symbol={isSelected ? 'select_check_box' : 'check_box'}
												alt={`${segment.label}`}
											/>
										</div>
									</div>
									<Typography
										variant="bodyBoldSm"
										cssOverrides={css({
											color: semanticColors.text.strong,
										})}
									>
										{segment.label}
									</Typography>
								</div>
							</Button>
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
						<Typography variant="bodyBoldMd">Audience Segments</Typography>
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
											: audienceSegmentStyles.audienceSegmentButton(false)
									}
								>
									<div css={audienceSegmentStyles.audienceSegmentIcon}>
										<FlagAtom segmentCode={segmentCode} />
									</div>
									<Typography
										variant="bodyBoldSm"
										cssOverrides={css({
											color: semanticColors.text.weak,
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
