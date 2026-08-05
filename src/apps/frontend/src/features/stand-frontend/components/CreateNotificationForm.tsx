import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { ArticleImportControl } from './ArticleImportControl';
import { ChannelSelector } from './ChannelSelector';
import { EmailFields } from './EmailFields';
import { SendButton } from './SendButton';
import { SendFailedModal } from './SendFailedModal';
import { SendNotificationModal } from './SendNotificationModal';

export const CreateNotificationForm = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);

	return (
		<div
			css={{
				marginTop: semanticSpacing.stackXl,
				marginBottom: semanticSpacing.stackXl,
				display: 'flex',
				flexDirection: 'column',
				width: '720px',
				paddingRight: semanticSpacing.stackSm,
				paddingLeft: '147px',
				gap: semanticSpacing.stackXl,
			}}
		>
			<Typography variant="heading2Xl" element="h2">
				Create a notification
			</Typography>

			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
					width: '476px',
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
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};
