import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { NewsletterFormValues } from '../notification-forms';
import { CreateNewsletterForm } from './CreateNewsletterForm';
import { EmailPreviewSection } from './EmailPreviewSection';
import { NotificationTabLayout } from './NotificationTabLayout';
import { EmailPreviewToggle } from './PreviewToggle';

export const CreateNewsletterEmailTab = () => {
	const { reset } = useFormContext<NewsletterFormValues>();

	useEffect(() => reset(), [reset]);

	return (
		<NotificationTabLayout
			channel="email"
			previewToggle={<EmailPreviewToggle />}
			renderForm={(activeSectionHref) => (
				<CreateNewsletterForm activeSectionHref={activeSectionHref} />
			)}
			previewSection={<EmailPreviewSection />}
		/>
	);
};
