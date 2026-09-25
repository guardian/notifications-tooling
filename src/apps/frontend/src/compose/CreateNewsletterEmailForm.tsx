import { type FormEvent, useContext, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useChannelConstraints } from '../hooks/useChannelConstraints';
import { AudienceSegmentsFormField } from '../segment/AudienceSegmentsFormField';
import { buildNewsletterEmailRequest } from '../utils/build-request-payloads';
import { htmlToSingleLineText } from '../utils/html-helpers';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { KickerFormField } from './KickerFormField';
import { NotificationFormContext } from './NotificationFormContext';
import {
	jumpToFormSection,
	NotificationFormSection,
} from './NotificationFormSection';
import { NotificationFormWrapper } from './NotificationFormWrapper';
import { PreviewTextFormField } from './PreviewTextFormField';
import { SubjectFormField } from './SubjectFormField';

interface CreateNewsletterEmailFormProps {
	initialArticleUrl?: string;
	initialSubjectText?: string;
	showReviewWarning?: boolean;
	showPreview: boolean;
	onTogglePreview: (showPreview: boolean) => void;
}

export const CreateNewsletterEmailForm = ({
	initialArticleUrl,
	initialSubjectText,
	showReviewWarning,
	showPreview,
	onTogglePreview,
}: CreateNewsletterEmailFormProps) => {
	const { composerState, updateComposerState } = useContext(
		NotificationFormContext,
	);
	const copiedSubjectText = useRef(initialSubjectText);
	const { clearErrors, handleSubmit, setValue } =
		useFormContext<NewsletterEmailFormValues>();

	const { data: constraints } = useChannelConstraints();
	const prepareSend = (values: NewsletterEmailFormValues) => {
		if (!composerState.article) {
			return;
		}
		const valuesToSend = showPreview ? values : { ...values, previewText: '' };
		updateComposerState({
			type: 'prepare-send',
			request: buildNewsletterEmailRequest({
				values: valuesToSend,
				article: composerState.article,
				requestedUrl: composerState.requestedUrl,
				idempotencyKey: crypto.randomUUID(),
			}),
		});
	};
	const handleSubmitForm = (event: FormEvent<HTMLFormElement>) => {
		clearErrors();
		void handleSubmit(
			(values) => {
				if (!composerState.article) {
					jumpToFormSection('article-section');
					return;
				}
				prepareSend(values);
			},
			(errors) => {
				if (!composerState.article) {
					jumpToFormSection('article-section');
				} else if (errors.kicker || errors.subjectText || errors.previewText) {
					jumpToFormSection('content-section');
				} else if (errors.audienceSegments) {
					jumpToFormSection('audience-section');
				} else if (errors.deliveryOption) {
					jumpToFormSection('delivery-timing-section');
				}
			},
		)(event);
	};

	return (
		<NotificationFormWrapper
			title="Create newsletter email"
			formLabel="Create newsletter email"
			channel="newsletter"
			initialArticleUrl={initialArticleUrl}
			showReviewWarning={showReviewWarning}
			sendButtonLabel="Send newsletter email"
			onSubmit={handleSubmitForm}
			onResetNotification={() => {
				copiedSubjectText.current = undefined;
				onTogglePreview(true);
				updateComposerState({ type: 'reset-newsletter-email' });
			}}
			onArticleImported={(article) => {
				onTogglePreview(true);

				const { headline, trailText } = article.fields ?? {};
				const subjectText = copiedSubjectText.current ?? headline;
				copiedSubjectText.current = undefined;
				if (subjectText !== undefined) {
					setValue('subjectText', subjectText);
				}
				const previewText = htmlToSingleLineText(trailText);
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
