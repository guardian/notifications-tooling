import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import type { ChannelOption, DeliveryOption } from '../types';
import { useAudienceEditions } from '../use-audience-editions';
import { AudienceSegmentsPreviewPill } from './AudienceSegments';
import { HTMLPreview } from './HTMLPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';
import { TestEmailForm } from './TestEmailForm';

interface EmailPreviewSectionProps {
	selectedSegments: string[];
	selectedChannel?: ChannelOption;
	selectedDeliveryTiming?: DeliveryOption;
}

export const EmailPreviewSection = ({
	selectedSegments,
	selectedChannel,
	selectedDeliveryTiming,
}: EmailPreviewSectionProps) => {
	const segments = useAudienceEditions('email');

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
			<AudienceSegmentsPreviewPill
				segments={segments}
				selected={selectedSegments}
			/>
			<HTMLPreview />
			<TestEmailForm />
		</PreviewSection>
	);
};
