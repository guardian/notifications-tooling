import { type FormEvent, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useChannelConstraints } from '../hooks/useChannelConstraints';
import { EditionsFormField } from '../segment/EditionsFormField';
import { useAppPushTopicTypes } from '../segment/useChannelAudiences';
import { getArticleThumbnail } from '../utils/article-thumbnail';
import { buildAppAlertRequest } from '../utils/build-request-payloads';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { AlertTypeFormField } from './AlertTypeFormField';
import { ArticleThumbnailImageFormField } from './ArticleThumbnailImageFormField';
import { HeadlineFormField } from './HeadlineFormField';
import { NotificationFormContext } from './NotificationContext';
import { NotificationFormSection } from './NotificationFormSection';
import { NotificationFormWrapper } from './NotificationFormWrapper';

export const CreateAppAlertForm = () => {
	const { handleSubmit, setError, setValue } =
		useFormContext<AppAlertFormValues>();
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	const { data: constraints } = useChannelConstraints();
	const topicTypes = useAppPushTopicTypes();
	const prepareSend = (values: AppAlertFormValues) => {
		if (!notification.content) {
			return;
		}
		updateNotification({
			type: 'prepare-send',
			request: buildAppAlertRequest({
				values,
				alertTypeLabel:
					topicTypes.find(({ id }) => id === values.alertType)?.label ??
					values.alertType,
				content: notification.content,
				requestedUrl: notification.requestedUrl,
				requestedBlock: notification.requestedBlock,
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
			title="Create app alert"
			formLabel="Create app alert"
			channel="push"
			sendButtonLabel="Send app alert"
			onSubmit={submitForm}
			onResetNotification={() =>
				updateNotification({ type: 'reset-app-alert' })
			}
			onArticleImported={(article, requestedBlock) => {
				setValue('headline', article.fields?.headline ?? article.webTitle);
				const articleThumbnailUrl =
					getArticleThumbnail(article, requestedBlock).src ?? '';
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
