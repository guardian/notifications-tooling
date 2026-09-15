import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { EmailPreviewSection } from '../preview/EmailPreviewSection';
import { EmailPreviewToggle } from '../preview/PreviewToggle';
import type { NewsletterFormValues } from '../utils/notification-forms';
import { CreateNewsletterForm } from './CreateNewsletterForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateNewsletterEmailTab = () => {
	const { reset, setValue, watch } = useFormContext<NewsletterFormValues>();
	const showPreview = watch('showPreview');

	useEffect(() => reset(), [reset]);

	return (
		<NotificationTabLayout
			channel="email"
			previewToggle={<EmailPreviewToggle />}
			renderForm={(activeSectionHref) => (
				<CreateNewsletterForm
					activeSectionHref={activeSectionHref}
					showPreview={showPreview}
					onTogglePreview={(isSelected) => {
						setValue('showPreview', isSelected, {
							shouldValidate: true,
						});
					}}
				/>
			)}
			previewSection={<EmailPreviewSection />}
		/>
	);
};
