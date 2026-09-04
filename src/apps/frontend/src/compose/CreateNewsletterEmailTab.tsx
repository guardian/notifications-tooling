import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { EmailPreviewSection } from '../preview/EmailPreviewSection';
import { EmailPreviewToggle } from '../preview/PreviewToggle';
import type { NewsletterFormValues } from '../utils/notification-forms';
import { CreateNewsletterForm } from './CreateNewsletterForm';
import { NotificationTabLayout } from './NotificationTabLayout';

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
