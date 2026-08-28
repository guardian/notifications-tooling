import { useContext } from 'react';
import { useWatch } from 'react-hook-form';
import {
	defaultNewsletterFormValues,
	type NewsletterFormValues,
} from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { useNewsletterSegmentOptions } from '../use-audience-editions';
import { FlagPreviewPill } from './FlagPreviewPill';
import { HTMLPreview } from './HTMLPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';
import { TestEmailForm } from './TestEmailForm';

export const EmailPreviewSection = () => {
	const {
		notification: { fetchedArticleId },
	} = useContext(NotificationFormContext);
	const segments = useNewsletterSegmentOptions();
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
			<FlagPreviewPill
				title="Audience"
				options={segments}
				selected={selectedSegments}
			/>
			<HTMLPreview />
			<TestEmailForm />
		</PreviewSection>
	);
};
