import { useContext } from 'react';
import { useWatch } from 'react-hook-form';
import type { NewsletterFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import {
	AudienceSegmentsPreviewPill,
	DEFAULT_SEGMENTS,
} from './AudienceSegments';
import { HTMLPreview } from './HTMLPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';
import { TestEmailForm } from './TestEmailForm';

export const EmailPreviewSection = () => {
	const {
		notification: { fetchedArticleId },
	} = useContext(NotificationFormContext);
	const selectedSegments = useWatch<NewsletterFormValues, 'audienceSegments'>({
		name: 'audienceSegments',
		defaultValue: [],
	});
	const selectedDeliveryTiming = useWatch<
		NewsletterFormValues,
		'deliveryOption'
	>({
		name: 'deliveryOption',
		defaultValue: 'immediate',
	});
	return (
		<PreviewSection
			title="Preview"
			description="The preview for the newsletter email will be shown below."
			isVisible={Boolean(fetchedArticleId)}
		>
			<SendInfoPreviewPill
				channel="email"
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
