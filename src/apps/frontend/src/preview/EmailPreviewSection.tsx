import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Typography } from '@guardian/stand/Typography';
import { useWatch } from 'react-hook-form';
import {
	defaultNewsletterFormValues,
	type NewsletterFormValues,
} from '../notification-forms';
import { alertBannerCss, customAlertBannerTheme } from '../themes';
import { useNewsletterSegmentOptions } from '../use-audience-editions';
import { FlagPreviewPill } from './FlagPreviewPill';
import { HTMLPreview } from './HTMLPreview';
import { PreviewSection } from './PreviewSection';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';
import { TestEmailForm } from './TestEmailForm';

export const EmailPreviewSection = () => {
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
			<HTMLPreview />
			<TestEmailForm />
		</PreviewSection>
	);
};
