import { type FormEvent, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useChannelConstraints } from '../hooks/useChannelConstraints';
import { EditionsFormField } from '../segment/EditionsFormField';
import { useAppAlertTopicTypes } from '../segment/useChannelAudiences';
import { getArticleThumbnail } from '../utils/article-thumbnail';
import { buildAppAlertRequest } from '../utils/build-request-payloads';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { AlertTypeFormField } from './AlertTypeFormField';
import { ArticleThumbnailImageFormField } from './ArticleThumbnailImageFormField';
import { HeadlineFormField } from './HeadlineFormField';
import { NotificationFormContext } from './NotificationFormContext';
import {
	jumpToFormSection,
	NotificationFormSection,
} from './NotificationFormSection';
import { NotificationFormWrapper } from './NotificationFormWrapper';

interface CreateAppAlertFormProps {
	initialArticleUrl?: string;
	showReviewWarning?: boolean;
}

export const CreateAppAlertForm = ({
	initialArticleUrl,
	showReviewWarning,
}: CreateAppAlertFormProps) => {
	const { clearErrors, handleSubmit, setValue } =
		useFormContext<AppAlertFormValues>();
	const { composerState, updateComposerState } = useContext(
		NotificationFormContext,
	);

	const { data: constraints } = useChannelConstraints();
	const topicTypes = useAppAlertTopicTypes();
	const prepareSend = (values: AppAlertFormValues) => {
		if (!composerState.article) {
			return;
		}
		updateComposerState({
			type: 'prepare-send',
			request: buildAppAlertRequest({
				values,
				alertTypeLabel:
					topicTypes.find(({ id }) => id === values.alertType)?.label ??
					values.alertType,
				article: composerState.article,
				requestedUrl: composerState.requestedUrl,
				requestedBlock: composerState.requestedBlock,
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
				} else if (errors.alertType || errors.editions) {
					jumpToFormSection('alert-section');
				} else if (errors.headline || errors.articleThumbnailUrl) {
					jumpToFormSection('content-section');
				} else if (errors.deliveryOption) {
					jumpToFormSection('delivery-timing-section');
				}
			},
		)(event);
	};

	return (
		<NotificationFormWrapper
			title="Create app alert"
			formLabel="Create app alert"
			channel="app-push"
			initialArticleUrl={initialArticleUrl}
			showReviewWarning={showReviewWarning}
			sendButtonLabel="Send app alert"
			onSubmit={handleSubmitForm}
			onResetNotification={() =>
				updateComposerState({ type: 'reset-app-alert' })
			}
			onArticleImported={(article) => {
				setValue(
					'headline',
					(article.fields?.headline ?? article.webTitle).trim(),
				);
				const articleThumbnailUrl = getArticleThumbnail(article).src ?? '';
				setValue('includeThumbnail', Boolean(articleThumbnailUrl));
				setValue('articleThumbnailUrl', articleThumbnailUrl);
			}}
		>
			<NotificationFormSection id="alert-section">
				<AlertTypeFormField />
				<EditionsFormField />
			</NotificationFormSection>
			<NotificationFormSection id="content-section">
				<HeadlineFormField constraints={constraints} />
				<ArticleThumbnailImageFormField />
			</NotificationFormSection>
		</NotificationFormWrapper>
	);
};
