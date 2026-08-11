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
import { checkboxIcon, selectedCheckboxIcon } from './FlagIcons';

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
				Audience segments
			</Typography>
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
							<Button
								key={segment.code}
								variant="tertiary"
								onClick={() => onSegmentToggle(segment.code)}
								aria-pressed={isSelected}
								cssOverrides={css([
									audienceSegmentStyles.audienceSegmentCheckBoxTile(isSelected),
									{ alignItems: 'flex-start', justifyItems: 'flex-start' },
								])}
							>
								<div
									css={css({
										display: 'flex',
										flexDirection: 'column',
										width: '100%',
										alignItems: 'flex-start',
										gap: semanticSpacing.stackXxs,
									})}
								>
									<div
										css={css({
											display: 'flex',
											flexDirection: 'row',
											justifyContent: 'space-between',
											alignItems: 'center',
											width: '100%',
										})}
									>
										<div css={audienceSegmentStyles.audienceSegmentIcon}>
											<FlagAtom segmentCode={segment.code} />
										</div>
										<div
											css={css({
												display: 'flex',
												height: '16px',
												width: '16px',
												alignItems: 'center',
												justifyContent: 'center',
											})}
										>
											<Icon
												alt={`${segment.label} selection box`}
												size="sm"
												aria-label={`${segment.label} selection box`}
											>
												{isSelected ? selectedCheckboxIcon : checkboxIcon}
											</Icon>
										</div>
									</div>
									<Typography
										variant="headingXs"
										cssOverrides={css({
											color: semanticColors.text.strong,
											padding: `${baseSpacing['4Px']} ${baseSpacing['8Px']} ${baseSpacing['6Px']} 0`,
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
