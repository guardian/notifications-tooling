import { css } from '@emotion/react';
import { baseSpacing, semanticColors } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { AudienceSegment, ChannelOption, EmailDeliveryOption } from '../types';
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
				flexBasis: 474,
				padding: baseSpacing['16Px'],
				display: 'flex',
				flexDirection: 'column',
				gap: baseSpacing['20Px'],
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
