import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import type {
	DisplayAppAlertTopicEditionId,
	NewsletterSegmentId,
} from '@models/api-contract/audience';
import { FlagAtom } from './FlagAtom';

type SegmentCode = NewsletterSegmentId | DisplayAppAlertTopicEditionId;

interface FlagPairProps {
	from: SegmentCode;
	to: SegmentCode;
}

const pillStyle = css({
	display: 'inline-flex',
	alignItems: 'center',
	gap: semanticSpacing.stackXxs,
	border: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
	backgroundColor: semanticColors.fill.weak,
	borderRadius: semanticRadius.cornerSm,
	padding: `${baseSpacing['2Px']} ${baseSpacing['4Px']}`,
});

const flagStyle = css({
	display: 'flex',
	'& svg': {
		width: '14px',
		height: '14px',
	},
});

/** A bordered pill showing two audience flags with a "»" separator, e.g. an edition routed to an international audience. */
export const FlagPair = ({ from, to }: FlagPairProps) => (
	<span css={pillStyle} aria-label={`${from} to ${to}`}>
		<span css={flagStyle}>
			<FlagAtom segmentCode={from} />
		</span>
		<span aria-hidden="true">»</span>
		<span css={flagStyle}>
			<FlagAtom segmentCode={to} />
		</span>
	</span>
);
