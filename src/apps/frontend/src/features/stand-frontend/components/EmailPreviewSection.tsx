import { useContext } from 'react';
import { useWatch } from 'react-hook-form';
import {
	defaultNewsletterFormValues,
	type NewsletterFormValues,
} from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { useAudienceEditions } from '../use-audience-editions';
import { AudienceSegmentsPreviewPill } from './AudienceSegments';
import { HTMLPreview } from './HTMLPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';
import { TestEmailForm } from './TestEmailForm';

export const EmailPreviewSection = () => {
	const {
		notification: { fetchedArticleId },
	} = useContext(NotificationFormContext);
	const segments = useAudienceEditions('email');
	const selectedSegments = useWatch<NewsletterFormValues, 'audienceSegments'>({
		name: 'audienceSegments',
		defaultValue: defaultNewsletterFormValues.audienceSegments,
	});
	const selectedDeliveryTiming = useWatch<
		NewsletterFormValues,
		'deliveryOption'
	>({
		name: 'deliveryOption',
		defaultValue: defaultNewsletterFormValues.deliveryOption,
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
				segments={segments}
				selected={selectedSegments}
			/>
			<HTMLPreview />
			<TestEmailForm />
		</PreviewSection>
	);
};
