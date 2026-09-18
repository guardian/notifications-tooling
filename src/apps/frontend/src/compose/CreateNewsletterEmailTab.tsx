import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { NewsletterEmailPreviewSection } from '../preview/NewsletterEmailPreviewSection';
import { NewsletterEmailPreviewToggle } from '../preview/PreviewToggle';
import { articleUrlSearchParam, toGuardianArticleUrl } from '../routes';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { CreateNewsletterEmailForm } from './CreateNewsletterEmailForm';
import { NotificationTabLayout } from './NotificationTabLayout';

export const CreateNewsletterEmailTab = () => {
	const { reset, setValue, watch } =
		useFormContext<NewsletterEmailFormValues>();
	const [searchParams] = useSearchParams();
	const initialArticleUrl = toGuardianArticleUrl(
		searchParams.get(articleUrlSearchParam),
	);
	const showPreview = watch('showPreview');

	useEffect(() => reset(), [reset]);

	return (
		<NotificationTabLayout
			channel="newsletter"
			previewToggle={<NewsletterEmailPreviewToggle />}
			form={
				<CreateNewsletterEmailForm
					initialArticleUrl={initialArticleUrl}
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
