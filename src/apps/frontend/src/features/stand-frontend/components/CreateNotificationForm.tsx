import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
import { useContext } from 'react';
import { useChannelConstraints } from '../api/useChannelConstraints';
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
	// Called before the early return: hooks cannot sit behind a conditional.
	const { data: constraints } = useChannelConstraints();
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
			<Typography variant="heading2Xl" element="h2">
				Create newsletter email
			</Typography>

			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackLg,
					width: '100%',
					[from.md]: {
						width: '476px',
					},
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

				<EmailFields constraints={constraints} />

				<SendButton />
				<SendNotificationModal />
				<SendFailedModal />
			</div>
		</div>
	);
};
