import { css } from '@emotion/react';
import {
	baseColors,
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import { Typography } from '@guardian/stand/Typography';
import { type AudienceSegment } from '../types';

export interface Segment {
	code: AudienceSegment;
	label: string;
}

interface AudienceSegmentPickerProps {
	segments?: Segment[];
	selected: AudienceSegment[];
	onChange: (selected: AudienceSegment[]) => void;
}

interface AudienceSegmentsPreviewPillProps {
	segments?: Segment[];
	selected: AudienceSegment[];
}

export const DEFAULT_SEGMENTS: Segment[] = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];
const styles = {
	audienceSegmentButton: (isSelected: boolean) =>
		css({
			backgroundColor: isSelected
				? baseColors.magenta[200]
				: semanticColors.fill.weak,
			color: isSelected
				? semanticColors.text.strongerInverse
				: semanticColors.text.weak,
			padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
			borderRadius: semanticRadius.cornerSm,
			display: 'flex',
			alignItems: 'center',
			gap: `${baseSpacing['8Px']}`,
			height: '32px',
		}),
	audienceSegmentIcon: (isSelected: boolean) =>
		css({
			borderTop: `${semanticSizing.border.default} solid  ${isSelected ? baseColors.magenta[500] : semanticColors.border.weak}`,
			borderRight: `${semanticSizing.border.default} solid  ${isSelected ? baseColors.magenta[500] : semanticColors.border.weak}`,
			borderBottom: `${semanticSizing.border.default} solid ${isSelected ? baseColors.magenta[500] : semanticColors.border.weak}`,
			borderLeft: `${semanticSizing.border.default} solid  ${isSelected ? baseColors.magenta[500] : semanticColors.border.weak}`,
			padding: `${baseSpacing['2Px']} ${baseSpacing['2Px']}`,
			gap: `${baseSpacing['8Px']}`,
			borderRadius: semanticRadius.cornerSm,
			backgroundColor: isSelected
				? baseColors.magenta[400]
				: semanticColors.fill.disabled,
			color: isSelected
				? semanticColors.text.strongerInverse
				: semanticColors.text.weak,
			height: '20px',
			width: '26px',
			fontSize: '12px',
			lineHeight: ' 16px',
			fontWeight: 700,
			textAlign: 'center',
		}),
};
export const AudienceSegments = ({
	segments = DEFAULT_SEGMENTS,
	selected,
	onChange,
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
			<Typography variant="bodyBoldMd">Audience Segments</Typography>
			<Typography variant="bodyCompactSm">
				Choose the audience the email notification will be sent to
			</Typography>

			<ButtonGroup size="lg">
				{segments.map((segment) => {
					const isSelected = selected.includes(segment.code);
					return (
						<Button
							key={segment.code}
							variant="tertiary"
							onClick={() => onSegmentToggle(segment.code)}
							aria-pressed={isSelected}
							cssOverrides={styles.audienceSegmentButton(isSelected)}
						>
							<div css={styles.audienceSegmentIcon(isSelected)}>
								{segment.code}
							</div>
							<Typography
								variant="bodyBoldSm"
								cssOverrides={css({
									color: isSelected
										? semanticColors.text.strongerInverse
										: semanticColors.text.weak,
								})}
							>
								{segment.label}
							</Typography>
						</Button>
					);
				})}
			</ButtonGroup>
		</div>
	);
};

export const AudienceSegmentsPreviewPill = ({
	segments = DEFAULT_SEGMENTS,
	selected,
}: AudienceSegmentsPreviewPillProps) => {
	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Audience Segments</Typography>

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
						<div key={segmentCode} css={styles.audienceSegmentButton(true)}>
							<div css={styles.audienceSegmentIcon(true)}>{segmentCode}</div>
							<Typography
								variant="bodyBoldSm"
								cssOverrides={css({
									color: semanticColors.text.strongerInverse,
								})}
							>
								{segmentLabel}
							</Typography>
						</div>
					);
				})}
			</div>
		</div>
	);
};
