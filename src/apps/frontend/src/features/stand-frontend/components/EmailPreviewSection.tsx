import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
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
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';
import { TestEmailForm } from './TestEmailForm';

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
	const {
		notification: { fetchedArticleId },
	} = useContext(NotificationFormContext);
	return (
		<PreviewSection
			title="Preview"
			description="The preview for the newsletter email and/or the app alert notification will be shown below."
			isVisible={Boolean(fetchedArticleId)}
		>
			<SendInfoPreviewPill
				channel={selectedChannel}
				deliveryTiming={selectedDeliveryTiming}
			/>
			<AudienceSegmentsPreviewPill
				segments={DEFAULT_SEGMENTS}
				selected={selectedSegments}
			/>
			<HTMLPreview />
			<TestEmailForm />
		</PreviewSection>
	);
};
