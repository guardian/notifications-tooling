import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelSelector } from './ChannelSelector';
import { EmailFields } from './EmailFields';
import { SendButton } from './SendButton';

export interface CreateNotificationFormProps {
	selectedDeliveryTiming?: string;
	onSelectedDeliveryTimingChange: (deliveryTiming?: string) => void;
}

export const CreateNotificationForm = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	return (
		<>
			<Typography variant="heading2Xl" element="h2">
				Create a Notification
			</Typography>

			<div
				css={{
					marginTop: semanticSpacing.stackXl,
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
				}}
			>
				<ArticleImportControl />

				<ChannelSelector
					selectedChannel={notification.parameters?.type}
					onChange={(channel) => {
						switch (channel) {
							case 'email':
							case 'push':
								updateNotification({ type: 'set-channel', channel });
								break;
						}
					}}
				/>

				<EmailFields />

				<SendButton />
			</div>
		</>
	);
};
