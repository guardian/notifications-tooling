import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import type { AudienceSegment, ChannelOption, DeliveryOption } from '../types';
import { HTMLPreview } from './HTMLPreview';
import { PreviewSection } from './PreviewSection';
import { DEFAULT_SEGMENTS } from './segment-options';
import { SegmentPreviewPill } from './SegmentPreviewPill';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';
import { TestEmailForm } from './TestEmailForm';

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
		<PreviewSection
			title="Preview"
			description="The preview for the newsletter email will be shown below."
			isVisible={Boolean(fetchedArticleId)}
		>
			<SendInfoPreviewPill
				channel={selectedChannel}
				deliveryTiming={selectedDeliveryTiming}
			/>
			<SegmentPreviewPill
				title="Audience segments"
				options={DEFAULT_SEGMENTS}
				selected={selectedSegments}
			/>
			<HTMLPreview />
			<TestEmailForm />
		</PreviewSection>
	);
};
