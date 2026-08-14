import { css } from '@emotion/react';
import { baseSpacing, semanticColors, semanticSpacing } from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { layer, topBarHeight } from '../themes';
import type { AudienceSegment, ChannelOption, DeliveryOption } from '../types';
import {
	AudienceSegmentsPreviewPill,
	DEFAULT_SEGMENTS,
} from './AudienceSegments';
import { HTMLPreview } from './HTMLPreview';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

interface EmailPreviewSectionProps {
	selectedSegments: AudienceSegment[];
	selectedChannel?: ChannelOption;
	selectedDeliveryTiming?: DeliveryOption;
}

export const EmailPreviewSection = ({
	selectedSegments,
	selectedChannel,
	selectedDeliveryTiming,
}: EmailPreviewSectionProps) => {
	const {
		notification: { fetchedArticleId },
	} = useContext(NotificationFormContext);
	return (
		<section
			css={css({
				background: semanticColors.bg.raisedLevel1,
				boxSizing: 'border-box',
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackLg,
				paddingTop: semanticSpacing.stackMd,
				paddingLeft: semanticSpacing.stackMd,
				paddingRight: semanticSpacing.stackMd,
				paddingBottom: baseSpacing['48Px'],
				width: '100%',
				[from.md]: {
					paddingLeft: semanticSpacing.stackLg,
					paddingRight: semanticSpacing.stackLg,
					paddingTop: semanticSpacing.stackLg,
				},
				[from.lg]: {
					flexBasis: 474,
					paddingTop: '48px',
					position: 'sticky',
					top: topBarHeight,
					zIndex: layer.stickyContent,
				},
			})}
		>
			<div
				css={css({
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
					visibility: fetchedArticleId ? 'visible' : 'hidden',
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
						The preview for the newsletter email and/or the app alert
						notification will be shown below.
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
			</div>
		</section>
	);
};
