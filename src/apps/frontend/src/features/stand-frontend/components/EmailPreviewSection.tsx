import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import type {
	AudienceSegment,
	ChannelOption,
	EmailDeliveryOption,
} from '../types';
import {
	AudienceSegmentsPreviewPill,
	DEFAULT_SEGMENTS,
} from './AudienceSegments';
import { HTMLPreview } from './HTMLPreview';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

interface EmailPreviewSectionProps {
	selectedSegments: AudienceSegment[];
	selectedChannel?: ChannelOption;
	selectedDeliveryTiming?: EmailDeliveryOption;
}

export const EmailPreviewSection = ({
	selectedSegments,
	selectedChannel,
	selectedDeliveryTiming,
}: EmailPreviewSectionProps) => {
	return (
		<section
			css={css({
				background: semanticColors.bg.raisedLevel1,
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackLg,
				paddingTop: semanticSpacing.stackLg,
				paddingLeft: semanticSpacing.stackLg,
				paddingRight: semanticSpacing.stackLg,
				paddingBottom: baseSpacing['48Px'],
				width: '100%',
				[from.lg]: {
					flexBasis: 474,
					paddingTop: '48px',
					position: 'sticky',
					top: '0px',
					zIndex: 1,
				},
			})}
		>
			<header
				css={css({
					display: 'flex',
					flexDirection: 'column',
					gap: baseSpacing['12Px'], // adjust spacing as needed
					alignItems: 'stretch',
				})}
			>
				<div
					css={{
						display: 'flex',
						alignItems: 'center',
						gap: 5,
					}}
				>
					<Icon symbol="preview" />
					<Typography variant="bodyBoldMd">Preview</Typography>
				</div>
				<Typography variant="bodySm">
					The preview for the newsletter email and/or the app alert notification
					will be shown below.
				</Typography>
			</header>
			<SendInfoPreviewPill
				channel={selectedChannel}
				deliveryTiming={selectedDeliveryTiming}
			/>
			<AudienceSegmentsPreviewPill
				segments={DEFAULT_SEGMENTS}
				selected={selectedSegments}
			/>
			<HTMLPreview />
		</section>
	);
};
