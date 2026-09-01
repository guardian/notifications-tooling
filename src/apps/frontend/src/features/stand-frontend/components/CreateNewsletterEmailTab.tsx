import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { CreateNotificationForm } from './CreateNotificationForm';
import { NewsletterDispatchDetails } from './DispatchReport';
import { EmailPreviewSection } from './EmailPreviewSection';
import { NotificationTabLayout } from './NotificationTabLayout';
import { EmailPreviewToggle } from './PreviewToggle';

export const CreateNewsletterEmailTab = () => {
	const { updateNotification } = useContext(NotificationFormContext);

	return (
		<NotificationTabLayout
			channel="email"
			onResetNotification={() =>
				updateNotification({ type: 'reset-newsletter-email' })
			}
			previewToggle={<EmailPreviewToggle />}
			renderForm={(activeSectionHref) => (
				<CreateNotificationForm activeSectionHref={activeSectionHref} />
			)}
			previewSection={<EmailPreviewSection />}
			dispatchDetails={<NewsletterDispatchDetails />}
		/>
	);
};
