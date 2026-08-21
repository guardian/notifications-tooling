import { semanticSpacing } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import { type FormEvent, useContext, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { htmlToSingleLineText } from '../../../util/html-helpers';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { buildNewsletterRequest } from '../build-request-payloads';
import type { NewsletterFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { ArticleImportControl } from './ArticleImportControl';
import { AudienceSegments } from './AudienceSegments';
import { ChannelDisplay } from './ChannelDisplay';
import { CreateFormTitle } from './CreateFormTitle';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';
import { EmailFields } from './EmailFields';
import { NotificationFormSection } from './NotificationFormSection';
import { SendButton } from './SendButton';
import { SendFailedModal } from './SendFailedModal';
import { SendNotificationModal } from './SendNotificationModal';

interface CreateNotificationFormProps {
	activeSectionHref: string;
}

export const CreateNotificationForm = ({
	activeSectionHref,
}: CreateNotificationFormProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const { control, handleSubmit, setError, setValue } =
		useFormContext<NewsletterFormValues>();
	const [articleInputText, setArticleInputText] = useState(
		() => notification.content?.webUrl ?? '',
	);
	const [lockArticleInputText, setLockArticleInputText] = useState(false);

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
		<>
			<form
				aria-label="Create newsletter email"
				onSubmit={submitForm}
				css={{
					marginTop: semanticSpacing.stackXl,
					marginBottom: semanticSpacing.stackXl,
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackXl,
				}}
			>
				<CreateFormTitle
					title={'Create newsletter email'}
					setArticleInputText={setArticleInputText}
					setLockArticleInputText={setLockArticleInputText}
					onResetNotification={() =>
						updateNotification({ type: 'reset-newsletter-email' })
					}
				/>

				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						gap: semanticSpacing.stackLg,
						width: '100%',
						[from.md]: {
							maxWidth: '500px',
						},
					}}
				>
					<NotificationFormSection
						id="article-section"
						isActive={activeSectionHref === '#article-section'}
					>
						<ArticleImportControl
							articleInputText={articleInputText}
							setArticleInputText={setArticleInputText}
							lockArticleInputText={lockArticleInputText}
							setLockArticleInputText={setLockArticleInputText}
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
						/>

						<ChannelDisplay channel="email" />
					</NotificationFormSection>
					<NotificationFormSection
						id="content-section"
						isActive={activeSectionHref === '#content-section'}
					>
						<EmailFields constraints={constraints} />
					</NotificationFormSection>
					<NotificationFormSection
						id="audience-section"
						isActive={activeSectionHref === '#audience-section'}
					>
						<Controller
							control={control}
							name="audienceSegments"
							render={({ field, fieldState }) => (
								<AudienceSegments
									selected={field.value}
									error={fieldState.error?.message}
									onChange={field.onChange}
								/>
							)}
						/>
					</NotificationFormSection>
					<NotificationFormSection
						id="delivery-timing-section"
						isActive={activeSectionHref === '#delivery-timing-section'}
					>
						<Controller
							control={control}
							name="deliveryOption"
							render={({ field }) => (
								<DeliveryAndTimingSelector
									selectedDeliveryTiming={field.value}
									channel="email"
									onChange={field.onChange}
								/>
							)}
						/>
					</NotificationFormSection>
					<NotificationFormSection
						id="send-button-section"
						isActive={activeSectionHref === '#send-button-section'}
					>
						<SendButton>Send newsletter email</SendButton>
					</NotificationFormSection>
				</div>
			</form>
			<SendNotificationModal />
			<SendFailedModal />
		</>
	);
};
