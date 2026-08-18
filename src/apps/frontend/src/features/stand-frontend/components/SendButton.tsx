import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import {
	checkIfReadyToSend,
	validateNotificationForm,
} from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';

interface SendButtonProps {
	children: React.ReactNode;
}

export const SendButton = ({ children }: SendButtonProps) => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const { parameters } = notification;

	if (!parameters) {
		return null;
	}
	const isReady = checkIfReadyToSend(notification);
	const hasFallbackError =
		validateNotificationForm(notification).includes('cannotBuildRequest');

	return (
		<div
			css={{
				maxWidth: semanticSizing.input.maxWidthPx,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				gap: semanticSpacing.stackXxs,
			}}
		>
			<Typography variant="labelFormCompactMd">Send</Typography>
			<Typography variant="helpTextFormMd" color={semanticColors.text.weak}>
				Before sending, review in the preview on the right
			</Typography>
			<Button
				onClick={() => {
					if (isReady) {
						updateNotification({
							type: 'set-attempted-send',
							hasAttemptedSend: false,
						});
						updateNotification({ type: 'set-show-confirm-send', isOpen: true });
						return;
					}

					updateNotification({
						type: 'set-attempted-send',
						hasAttemptedSend: true,
					});
					updateNotification({ type: 'set-show-confirm-send', isOpen: false });
				}}
				variant="primary"
			>
				{children}
			</Button>
			{hasFallbackError && (
				<InlineMessage level="error">
					The form contains some missing or invalid data
				</InlineMessage>
			)}
		</div>
	);
};
