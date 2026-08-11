import { css } from '@emotion/react';
import {
	baseColors,
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Checkbox } from '@guardian/stand/Checkbox';
import { InlineMessage } from '@guardian/stand/InlineMessage';
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
const styles = {
	audienceSegmentCheckbox: css({
		backgroundColor: semanticColors.fill.weak,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		borderRadius: semanticRadius.cornerSm,
		boxSizing: 'border-box',
		display: 'grid',
		gridTemplateColumns: '1fr auto',
		gridTemplateRows: 'auto auto',
		gap: baseSpacing['8Px'],
		minHeight: '64px',
		minWidth: '144px',
		padding: baseSpacing['8Px'],
		'&[data-selected="true"]': {
			backgroundColor: baseColors.magenta['900'],
			borderColor: semanticColors.border.strong,
		},
		'&[data-selected] > .checkbox-indicator': {
			backgroundColor: baseColors.magenta['200'],
			borderColor: baseColors.magenta['200'],
		},
		'& > .checkbox-indicator': {
			alignSelf: 'start',
			gridColumn: 2,
			gridRow: 1,
			justifySelf: 'end',
		},
		'&:hover': {
			backgroundColor: semanticColors.fill.weakPressed,
		},
	}),
	audienceSegmentPill: css({
		backgroundColor: semanticColors.fill.weak,
		color: semanticColors.text.weak,
		'&:hover': {
			backgroundColor: semanticColors.fill.weakPressed,
			color: semanticColors.text.weak,
		},
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
		borderRadius: semanticRadius.cornerSm,
		display: 'flex',
		alignItems: 'center',
		gap: `${baseSpacing['8Px']}`,
		height: '32px',
	}),
	audienceSegmentIcon: css({
		width: '24px',
		height: '24px',
	}),
	isConfirmationStyle: css({
		backgroundColor: semanticColors.fill.weak,
		color: semanticColors.text.weak,
		border: `${semanticSizing.border.default} solid ${semanticColors.border.weaker}`,
		padding: `${baseSpacing['6Px']} ${baseSpacing['8Px']}`,
		borderRadius: semanticRadius.cornerSm,
		display: 'flex',
		alignItems: 'center',
		gap: `${baseSpacing['8Px']}`,
		height: '32px',
	}),
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
			<Typography variant="bodyBoldMd" id="audience-section">
				Audience segments
			</Typography>
			<Typography variant="bodyCompactSm">
				Choose the audience the email notification will be sent to
			</Typography>

			<div
				css={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: semanticSpacing.stackXs,
				}}
			>
				{segments.map((segment) => {
					const isSelected = selected.includes(segment.code);
					return (
						<Checkbox
							key={segment.code}
							isSelected={isSelected}
							onChange={() => onSegmentToggle(segment.code)}
							cssOverrides={styles.audienceSegmentCheckbox}
						>
							<div
								css={{
									display: 'contents',
								}}
							>
								<div
									css={[
										styles.audienceSegmentIcon,
										css({ gridColumn: 1, gridRow: 1 }),
									]}
								>
									<FlagAtom segmentCode={segment.code} />
								</div>
								<Typography
									variant="bodyBoldSm"
									cssOverrides={css({
										color: semanticColors.text.weak,
										gridColumn: '1 / -1',
										gridRow: 2,
									})}
								>
									{segment.label}
								</Typography>
							</div>
						</Checkbox>
					);
				})}
			</div>

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
									? styles.isConfirmationStyle
									: styles.audienceSegmentPill
							}
						>
							<div css={styles.audienceSegmentIcon}>
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
	);
};
