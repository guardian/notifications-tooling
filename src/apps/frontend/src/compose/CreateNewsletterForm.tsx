import { type FormEvent, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { AudienceSegmentsFormField } from '../segment/AudienceSegmentsFormField';
import { htmlToSingleLineText } from '../ui/html-helpers';
import { buildNewsletterRequest } from './build-request-payloads';
import { KickerFormField } from './KickerFormField';
import type { NewsletterFormValues } from './notification-forms';
import { NotificationFormContext } from './NotificationContext';
import { NotificationFormSection } from './NotificationFormSection';
import { NotificationFormWrapper } from './NotificationFormWrapper';
import { PreviewTextFormField } from './PreviewTextFormField';
import { SubjectFormField } from './SubjectFormField';
import { useChannelConstraints } from './useChannelConstraints';

interface CreateNewsletterFormProps {
	activeSectionHref: string;
}

export const CreateNewsletterForm = ({
	activeSectionHref,
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
		updateNotification({
			type: 'prepare-send',
			request: buildNewsletterRequest({
				values,
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
			activeSectionHref={activeSectionHref}
			title="Create newsletter email"
			formLabel="Create newsletter email"
			channel="email"
			sendButtonLabel="Send newsletter email"
			onSubmit={submitForm}
			onResetNotification={() =>
				updateNotification({ type: 'reset-newsletter-email' })
			}
			onArticleImported={(article) => {
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
			<NotificationFormSection
				id="content-section"
				isActive={activeSectionHref === '#content-section'}
			>
				<KickerFormField />
				<SubjectFormField constraints={constraints} />
				<PreviewTextFormField constraints={constraints} />
			</NotificationFormSection>
			<NotificationFormSection
				id="audience-section"
				isActive={activeSectionHref === '#audience-section'}
			>
				<AudienceSegmentsFormField />
			</NotificationFormSection>
		</NotificationFormWrapper>
	);
};
