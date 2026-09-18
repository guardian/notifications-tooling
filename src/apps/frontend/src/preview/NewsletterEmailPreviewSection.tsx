import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Typography } from '@guardian/stand/Typography';
import { useWatch } from 'react-hook-form';
import { FlagPreviewPill } from '../segment/FlagPreviewPill';
import { useNewsletterEmailSegmentOptions } from '../segment/useAudienceEditions';
import { SendInfoPreviewPill } from '../send/SendInfoPreviewPill';
import { TestEmailForm } from '../send/TestEmailForm';
import { alertBannerCss, customAlertBannerTheme } from '../themes';
import {
	defaultNewsletterEmailFormValues,
	type NewsletterEmailFormValues,
} from '../utils/notification-forms';
import { NewsletterEmailPreview } from './HTMLPreview';
import { PreviewSection } from './PreviewSection';

export const NewsletterEmailPreviewSection = () => {
	const segments = useNewsletterEmailSegmentOptions();
	const selectedSegments = useWatch<
		NewsletterEmailFormValues,
		'audienceSegments'
	>({
		name: 'audienceSegments',
		defaultValue: defaultNewsletterEmailFormValues.audienceSegments,
	});
	const selectedDeliveryTiming = useWatch<
		NewsletterEmailFormValues,
		'deliveryOption'
	>({
		name: 'deliveryOption',
		defaultValue: defaultNewsletterEmailFormValues.deliveryOption,
	});
	return (
		<PreviewSection
			title="Preview"
			description="The preview for the newsletter email will be shown below."
		>
			<SendInfoPreviewPill
				channel="newsletter"
				deliveryTiming={selectedDeliveryTiming}
			/>
			<FlagPreviewPill
				title="Audience"
				options={segments}
				selected={selectedSegments}
			/>
			<AlertBanner
				level="information"
				showIcon
				cssOverrides={alertBannerCss}
				theme={customAlertBannerTheme}
			>
				<Typography
					variant={'bodyBoldSm'}
					cssOverrides={css({ color: semanticColors.text.blue })}
				>
					Email appearance may vary across different email clients and devices
				</Typography>
			</AlertBanner>
			<NewsletterEmailPreview />
			<TestEmailForm />
		</PreviewSection>
	);
};
