import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { NewsletterEmailPreviewSection } from '../preview/NewsletterEmailPreviewSection';
import { NewsletterEmailPreviewToggle } from '../preview/PreviewToggle';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { CreateNewsletterEmailForm } from './CreateNewsletterEmailForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateNewsletterEmailTab = () => {
	const { reset, setValue, watch } =
		useFormContext<NewsletterEmailFormValues>();
	const includePreviewText = watch('includePreviewText');

	useEffect(() => reset(), [reset]);

	return (
		<NotificationTabLayout
			channel="newsletter"
			previewToggle={<NewsletterEmailPreviewToggle />}
			form={
				<CreateNewsletterEmailForm
					includePreviewText={includePreviewText}
					onIncludePreviewTextChange={(isSelected) => {
						setValue('includePreviewText', isSelected, {
							shouldValidate: true,
						});
					}}
				/>
			}
			previewSection={<NewsletterEmailPreviewSection />}
		/>
	);
};
