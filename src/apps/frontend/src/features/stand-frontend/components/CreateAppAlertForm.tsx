import { semanticSpacing } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import { useContext, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { buildAppAlertRequest } from '../build-request-payloads';
import type { AppAlertFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { AlertEditionsSection } from './AlertEditionsSection';
import { AppAlertFields } from './AppAlertFields';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelSelector } from './ChannelSelector';
import { CreateFormTitle } from './CreateFormTitle';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';
import { NotificationFormSection } from './NotificationFormSection';
import { SendButton } from './SendButton';
import { SendFailedModal } from './SendFailedModal';
import { SendNotificationModal } from './SendNotificationModal';

interface CreateAppAlertFormProps {
	activeSectionHref: string;
}

export const CreateAppAlertForm = ({
	activeSectionHref,
}: CreateAppAlertFormProps) => {
	const { control, setValue } = useFormContext<AppAlertFormValues>();
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	const { data: constraints } = useChannelConstraints();

	const [articleInputText, setArticleInputText] = useState(
		() => notification.content?.webUrl ?? '',
	);

	const [lockArticleInputText, setLockArticleInputText] = useState(false);

	return (
		<div
			css={{
				marginTop: semanticSpacing.stackXl,
				marginBottom: semanticSpacing.stackXl,
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXl,
			}}
		>
			<CreateFormTitle
				title={'Create app alert'}
				setArticleInputText={setArticleInputText}
				setLockArticleInputText={setLockArticleInputText}
				onResetNotification={() =>
					updateNotification({ type: 'reset-app-alert' })
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
						onArticleImported={(article) =>
							setValue('headline', article.fields?.headline ?? article.webTitle)
						}
					/>

					<ChannelSelector selectedChannel="push" onChange={() => {}} />
				</NotificationFormSection>
				<NotificationFormSection
					id="alert-section"
					isActive={activeSectionHref === '#alert-section'}
				>
					<AlertEditionsSection />
				</NotificationFormSection>
				<NotificationFormSection
					id="content-section"
					isActive={activeSectionHref === '#content-section'}
				>
					<AppAlertFields constraints={constraints} />
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
								channel="push"
								onChange={field.onChange}
							/>
						)}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="send-button-section"
					isActive={activeSectionHref === '#send-button-section'}
				>
					<SendButton buildRequest={buildAppAlertRequest}>
						Send app alert
					</SendButton>
				</NotificationFormSection>
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};
