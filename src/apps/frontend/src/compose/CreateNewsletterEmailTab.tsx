import { useLayoutEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { NewsletterEmailPreviewSection } from '../preview/NewsletterEmailPreviewSection';
import { NewsletterEmailPreviewToggle } from '../preview/PreviewToggle';
import {
	defaultNewsletterEmailFormValues,
	type NewsletterEmailFormValues,
} from '../utils/notification-forms';
import { CreateNewsletterEmailForm } from './CreateNewsletterEmailForm';
import { NotificationTabLayout } from './NotificationTabLayout';
import { useNotificationPrefill } from './useNotificationPrefill';

export const CreateNewsletterEmailTab = () => {
	const { reset, setValue, watch } =
		useFormContext<NewsletterEmailFormValues>();
	const routePrefill = useNotificationPrefill('newsletter');
	const [prefill] = useState(routePrefill);
	const showPreview = watch('showPreview');

	useLayoutEffect(
		() =>
			reset(
				{ ...defaultNewsletterEmailFormValues, ...prefill?.fields },
				{ keepDefaultValues: true },
			),
		[prefill, reset],
	);

	return (
		<NotificationTabLayout
			channel="newsletter"
			previewToggle={<NewsletterEmailPreviewToggle />}
			form={
				<CreateNewsletterEmailForm
					initialArticleUrl={prefill?.articleUrl}
					fieldOverrides={prefill?.fields}
					showPreview={showPreview}
					onTogglePreview={(isSelected) => {
						setValue('showPreview', isSelected, {
							shouldValidate: true,
						});
					}}
				/>
			}
			previewSection={<NewsletterEmailPreviewSection />}
		/>
	);
};
