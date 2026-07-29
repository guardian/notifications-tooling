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
import { FlagAtom } from './FlagAtom';

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
	isConfirmation?: boolean;
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
			'&:hover': {
				backgroundColor: isSelected
					? baseColors.magenta[200]
					: semanticColors.fill.weakPressed,
				color: isSelected
					? semanticColors.text.strongerInverse
					: semanticColors.text.weak,
			},
			padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
			borderRadius: semanticRadius.cornerSm,
			display: 'flex',
			alignItems: 'center',
			gap: `${baseSpacing['8Px']}`,
			height: '32px',
		}),
	audienceSegmentIcon: css({
		borderTop: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
		borderRight: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
		borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		borderLeft: `${semanticSizing.border.default} solid  ${semanticColors.border.weak}`,
		width: '24px',
		height: '18px',
		gap: `${baseSpacing['8Px']}`,
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
							<div css={styles.audienceSegmentIcon}>
								<FlagAtom segmentCode={segment.code} />
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
	isConfirmation = false,
}: AudienceSegmentsPreviewPillProps) => {
	return (
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
									? styles.audienceSegmentButton(false)
									: styles.audienceSegmentButton(true)
							}
						>
							<div css={styles.audienceSegmentIcon}>
								<FlagAtom segmentCode={segmentCode} />
							</div>
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
