import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { checkIfReadyToSend } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import type { NotificationState } from '../types';

const buttonText = (
	parameters: Required<NotificationState>['parameters'],
): string => {
	switch (parameters.type) {
		case 'email':
			return 'Send newsletter email';
		case 'push':
			return 'Send push notification';
	}
};

export const SendButton = () => {
	const { notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const { parameters } = notification;

	if (!parameters) {
		return null;
	}
	const isReady = checkIfReadyToSend(notification);

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
				id={'send-button-section'}
			>
				{buttonText(parameters)}
			</Button>
		</div>
	);
};
