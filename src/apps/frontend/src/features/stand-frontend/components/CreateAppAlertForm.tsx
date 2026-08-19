import { semanticSpacing } from '@guardian/stand';
import { from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { useChannelConstraints } from '../api/useChannelConstraints';
import { NotificationFormContext } from '../NotificationContext';
import type { DeliveryOption } from '../types';
import type { ChannelOption } from '../types';
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
	const { updateNotification } = useContext(NotificationFormContext);

	const { data: constraints } = useChannelConstraints();

	const channel = 'push'; //TODO - change to notification.parameters.type
	const pushDeliveryOption = 'appImmediate'; //TODO - change to notification.parameters.pushDeliveryOption
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
			<CreateFormTitle title={'Create app alert'} />

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
						selectedChannel={channel} //TODO -change to notification.parameters.type
						onChange={(channel) => {
							updateNotification({
								type: 'set-channel',
								channel: channel as ChannelOption,
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="alert-section"
					isActive={activeSectionHref === '#alert-section'}
				>
					<AlertEditionsSection />
				</NotificationFormSection>
				<NotificationFormSection
					id="headline-section"
					isActive={activeSectionHref === '#headline-section'}
				>
					<AppAlertFields constraints={constraints} />
				</NotificationFormSection>
				<NotificationFormSection
					id="delivery-timing-section"
					isActive={activeSectionHref === '#delivery-timing-section'}
				>
					<DeliveryAndTimingSelector
						selectedDeliveryTiming={pushDeliveryOption}
						channel={channel} //TODO - change to notification.parameters.type
						onChange={(pushDeliveryOption) => {
							updateNotification({
								type: 'set-delivery-timing',
								deliveryOption: pushDeliveryOption as DeliveryOption,
							});
						}}
					/>
				</NotificationFormSection>
				<NotificationFormSection
					id="send-button-section"
					isActive={activeSectionHref === '#send-button-section'}
				>
					<SendButton>{'Send push notification'}</SendButton>
				</NotificationFormSection>
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};
