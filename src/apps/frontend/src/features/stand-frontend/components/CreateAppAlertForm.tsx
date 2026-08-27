import { type FormEvent, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { buildAppAlertRequest } from '../build-request-payloads';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { AlertTypeFormField } from './AlertTypeFormField';
import { ArticleThumbnailImageFormField } from './ArticleThumbnailImageFormField';
import { EditionsFormField } from './EditionsFormField';
import { HeadlineFormField } from './HeadlineFormField';
import { NotificationFormSection } from './NotificationFormSection';
import { NotificationFormWrapper } from './NotificationFormWrapper';

interface CreateAppAlertFormProps {
	activeSectionHref: string;
}

export const CreateAppAlertForm = ({
	activeSectionHref,
}: CreateAppAlertFormProps) => {
	const { handleSubmit, setError, setValue } =
		useFormContext<AppAlertFormValues>();
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	const { data: constraints } = useChannelConstraints();
	const prepareSend = (values: AppAlertFormValues) => {
		if (!notification.content) {
			return;
		}
		updateNotification({
			type: 'prepare-send',
			request: buildAppAlertRequest({
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
			title="Create app alert"
			formLabel="Create app alert"
			channel="push"
			sendButtonLabel="Send app alert"
			onSubmit={submitForm}
			onResetNotification={() =>
				updateNotification({ type: 'reset-app-alert' })
			}
			onArticleImported={(article) =>
				setValue('headline', article.fields?.headline ?? article.webTitle)
			}
		>
			<NotificationFormSection
				id="alert-section"
				isActive={activeSectionHref === '#alert-section'}
			>
				<AlertTypeFormField />
				<EditionsFormField />
			</NotificationFormSection>
			<NotificationFormSection
				id="content-section"
				isActive={activeSectionHref === '#content-section'}
			>
				<HeadlineFormField constraints={constraints} />
				<ArticleThumbnailImageFormField />
			</NotificationFormSection>
		</NotificationFormWrapper>
	);
};
