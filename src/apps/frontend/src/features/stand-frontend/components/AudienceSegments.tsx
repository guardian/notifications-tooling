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

export interface Segment {
	code: string;
	label: string;
}

interface AudienceSegmentPickerProps {
	segments?: Segment[];
	selected: string[];
	onChange: (selected: string[]) => void;
}

interface AudienceSegmentsPreviewProps {
	segments?: Segment[];
	selected: string[];
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
			borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
			borderBottom: `${semanticSizing.border.default} solid ${isSelected ? baseColors.magenta[500] : semanticColors.border.weak}`,
			borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
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
		}),
};
export const AudienceSegments = ({
	segments = DEFAULT_SEGMENTS,
	selected,
	onChange,
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

export const AudienceSegmentsPreview = ({
	segments = DEFAULT_SEGMENTS,
	selected,
}: AudienceSegmentsPreviewProps) => {
	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Audience Segments</Typography>

			<ButtonGroup size="lg">
				{selected.map((segmentCode) => {
					const matchingSegment = segments.find(
						(segment) => segment.code === segmentCode,
					);
					const segmentLabel = matchingSegment?.label ?? segmentCode;
					return (
						<Button
							key={segmentCode}
							variant="tertiary"
							cssOverrides={styles.audienceSegmentButton(true)}
						>
							<div css={styles.audienceSegmentIcon(true)}>{segmentCode}</div>
							<Typography
								variant="bodyBoldSm"
								cssOverrides={css({
									color: semanticColors.text.strongerInverse,
								})}
							>
								{segmentLabel}
							</Typography>
						</Button>
					);
				})}
			</ButtonGroup>
		</div>
	);
};
