import { semanticSpacing } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { validateNotificationForm } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import type { ChannelOption } from '../types';
import type { DeliveryOption } from '../types';
import { ArticleImportControl } from './ArticleImportControl';
import { AudienceSegments } from './AudienceSegments';
import { ChannelSelector } from './ChannelSelector';
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
	const { data: constraints } = useChannelConstraints();

	if (!notification.parameters) {
		return null;
	}

	const emailParameters =
		notification.parameters.type === 'email'
			? notification.parameters
			: undefined;
	const channel = emailParameters?.type ?? 'email';
	const emailDeliveryOption =
		emailParameters?.emailDeliveryOption ?? 'immediate';

	const audienceSegments = emailParameters?.audienceSegments ?? [];
	const requiredFieldErrors = validateNotificationForm(notification);
	const shouldShowErrors = notification.hasAttemptedSend;

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
			<CreateFormTitle title={'Create newsletter email'} />

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
					<ArticleImportControl />

					<ChannelSelector
						selectedChannel={channel}
						onChange={(channel) => {
							updateNotification({
								type: 'set-channel',
								channel: channel as ChannelOption,
							});
						}}
					/>
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
					<AudienceSegments
						selected={audienceSegments}
						error={
							shouldShowErrors &&
							requiredFieldErrors.includes('audienceSegments')
								? 'Please select an audience segment'
								: undefined
						}
						onChange={(audienceSegments) => {
							updateNotification({
								type: 'modify-email-parameters',
								mod: { audienceSegments },
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="delivery-timing-section"
					isActive={activeSectionHref === '#delivery-timing-section'}
				>
					<DeliveryAndTimingSelector
						selectedDeliveryTiming={emailDeliveryOption}
						channel={channel} //TODO - change to notification.parameters.type
						onChange={(emailDeliveryOption) => {
							updateNotification({
								type: 'set-delivery-timing',
								deliveryOption: emailDeliveryOption as DeliveryOption,
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="send-button-section"
					isActive={activeSectionHref === '#send-button-section'}
				>
					<SendButton>{'Send newsletter email'}</SendButton>
				</NotificationFormSection>
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};
