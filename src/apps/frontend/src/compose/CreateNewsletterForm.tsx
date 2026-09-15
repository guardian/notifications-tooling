import { type FormEvent, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useChannelConstraints } from '../hooks/useChannelConstraints';
import { AudienceSegmentsFormField } from '../segment/AudienceSegmentsFormField';
import { buildNewsletterRequest } from '../utils/build-request-payloads';
import { htmlToSingleLineText } from '../utils/html-helpers';
import type { NewsletterFormValues } from '../utils/notification-forms';
import { KickerFormField } from './KickerFormField';
import { NotificationFormContext } from './NotificationContext';
import { NotificationFormSection } from './NotificationFormSection';
import { NotificationFormWrapper } from './NotificationFormWrapper';
import { PreviewTextFormField } from './PreviewTextFormField';
import { SubjectFormField } from './SubjectFormField';

interface CreateNewsletterFormProps {
	showPreview: boolean;
	onTogglePreview: (showPreview: boolean) => void;
}

export const CreateNewsletterForm = ({
	showPreview,
	onTogglePreview,
}: CreateNewsletterFormProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const { handleSubmit, setError, setValue } =
		useFormContext<NewsletterFormValues>();

	const { data: constraints } = useChannelConstraints();
	const prepareSend = (values: NewsletterFormValues) => {
		if (!notification.content) {
			return;
		}
		const valuesToSend = showPreview ? values : { ...values, preview: '' };
		updateNotification({
			type: 'prepare-send',
			request: buildNewsletterRequest({
				values: valuesToSend,
				content: notification.content,
				idempotencyKey: crypto.randomUUID(),
			}),
		});
	};
	const submitForm = (event: FormEvent<HTMLFormElement>) => {
		if (!notification.content) {
			setError('root.article', {
				message: 'Paste a URL to fetch an article',
			});
		}
		void handleSubmit(prepareSend)(event);
	};

	return (
		<NotificationFormWrapper
			title="Create newsletter email"
			formLabel="Create newsletter email"
			channel="email"
			sendButtonLabel="Send newsletter email"
			onSubmit={submitForm}
			onResetNotification={() => {
				onTogglePreview(true);
				updateNotification({ type: 'reset-newsletter-email' });
			}}
			onArticleImported={(article) => {
				onTogglePreview(true);

				const { headline, standfirst } = article.fields ?? {};
				if (headline) {
					setValue('subject', headline);
				}
				const preview = htmlToSingleLineText(standfirst);
				if (preview) {
					setValue('preview', preview);
				}
			}}
		>
			<NotificationFormSection id="content-section">
				<KickerFormField />
				<SubjectFormField constraints={constraints} />
				<PreviewTextFormField
					constraints={constraints}
					showPreview={showPreview}
					onTogglePreview={onTogglePreview}
				/>
			</NotificationFormSection>
			<NotificationFormSection id="audience-section">
				<AudienceSegmentsFormField />
			</NotificationFormSection>
		</NotificationFormWrapper>
	);
};
