import { type FormEvent, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useChannelConstraints } from '../hooks/useChannelConstraints';
import { AudienceSegmentsFormField } from '../segment/AudienceSegmentsFormField';
import { buildNewsletterEmailRequest } from '../utils/build-request-payloads';
import { htmlToSingleLineText } from '../utils/html-helpers';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { KickerFormField } from './KickerFormField';
import { NotificationFormContext } from './NotificationFormContext';
import { NotificationFormSection } from './NotificationFormSection';
import { NotificationFormWrapper } from './NotificationFormWrapper';
import { PreviewTextFormField } from './PreviewTextFormField';
import { SubjectFormField } from './SubjectFormField';

interface CreateNewsletterEmailFormProps {
	includePreviewText: boolean;
	onIncludePreviewTextChange: (includePreviewText: boolean) => void;
}

export const CreateNewsletterEmailForm = ({
	includePreviewText,
	onIncludePreviewTextChange,
}: CreateNewsletterEmailFormProps) => {
	const { composerState, dispatchComposerAction } = useContext(
		NotificationFormContext,
	);
	const { handleSubmit, setError, setValue } =
		useFormContext<NewsletterEmailFormValues>();

	const { data: constraints } = useChannelConstraints();
	const prepareSend = (values: NewsletterEmailFormValues) => {
		if (!composerState.article) {
			return;
		}
		const valuesToSend = includePreviewText
			? values
			: { ...values, previewText: '' };
		dispatchComposerAction({
			type: 'prepare-send',
			request: buildNewsletterEmailRequest({
				values: valuesToSend,
				article: composerState.article,
				idempotencyKey: crypto.randomUUID(),
			}),
		});
	};
	const handleSubmitForm = (event: FormEvent<HTMLFormElement>) => {
		if (!composerState.article) {
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
			channel="newsletter"
			sendButtonLabel="Send newsletter email"
			onSubmit={handleSubmitForm}
			onResetNotification={() => {
				onIncludePreviewTextChange(true);
				dispatchComposerAction({ type: 'reset-newsletter-email' });
			}}
			onArticleImported={(article) => {
				onIncludePreviewTextChange(true);

				const { headline, standfirst } = article.fields ?? {};
				if (headline) {
					setValue('subjectText', headline);
				}
				const previewText = htmlToSingleLineText(standfirst);
				if (previewText) {
					setValue('previewText', previewText);
				}
			}}
		>
			<NotificationFormSection id="content-section">
				<KickerFormField />
				<SubjectFormField constraints={constraints} />
				<PreviewTextFormField
					constraints={constraints}
					includePreviewText={includePreviewText}
					onIncludePreviewTextChange={onIncludePreviewTextChange}
				/>
			</NotificationFormSection>
			<NotificationFormSection id="audience-section">
				<AudienceSegmentsFormField />
			</NotificationFormSection>
		</NotificationFormWrapper>
	);
};
