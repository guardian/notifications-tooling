import { Button } from '@guardian/stand/Button';
import { ButtonGroup } from '@guardian/stand/ButtonGroup';
import { Typography } from '@guardian/stand/Typography';
import {
	baseColors,
	baseSpacing,
	semanticColors,
	semanticSizing,
	semanticSpacing,
	semanticRadius
} from '@guardian/stand';
import { css } from '@emotion/react';

export interface Segment {
	code: string;
	label: string;
}

interface AudienceSegmentPickerProps {
	segments?: Segment[];
	selected: string[];
	onChange: (selected: string[]) => void;
}

const DEFAULT_SEGMENTS: Segment[] = [
	{ code: 'UK', label: 'United Kingdom' },
	{ code: 'US', label: 'United States' },
	{ code: 'AU', label: 'Australia' },
];
const styles = {
	audienceSegmentButton: (isSelected: boolean) =>
		css({
			backgroundColor: isSelected
				? baseColors.magenta[200]
				: semanticColors.fill.neutral,
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
	audienceSegmentLabel: (isSelected: boolean) =>
		css({
			color: isSelected ? semanticColors.text.red : semanticColors.text.weak,
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

			<ButtonGroup size="lg" >
				{segments.map((segment) => {
					const isSelected = selected.includes(segment.code);
					return (
						<Button
							key={segment.code}
							variant="tertiary"
							onClick={() => onSegmentToggle(segment.code)}
							aria-pressed={isSelected}
							cssOverrides={styles.audienceSegmentButton(isSelected)}
							height="14px"
							gap="12px"
						>
							<div css={styles.audienceSegmentIcon(isSelected)}>
								{segment.code}
							</div>
							<Typography variant="bodyBoldSm" cssOverrides={css({ color: isSelected ? semanticColors.text.strongerInverse : semanticColors.text.weak })}>
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
	onChange,
}: AudienceSegmentPickerProps) => {
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
				{selected.map((segment) => {
					return (
						<Button
							key={segment}
							variant="tertiary"
							onClick={()=>{}}
							cssOverrides={styles.audienceSegmentButton(true)}
							height="14px"
							gap="12px"
						>
							<div css={styles.audienceSegmentIcon(true)}>
								{segment}
							</div>
							<Typography
								variant="bodyBoldSm"
								cssOverrides={css({
									color: semanticColors.text.strongerInverse,
								})}
							>
								{segments.map(s=>s.code === segment ? s.label : '').filter(Boolean)[0]}
							</Typography>
						</Button>
					);
				})}
			</ButtonGroup>
		</div>
	);
};
