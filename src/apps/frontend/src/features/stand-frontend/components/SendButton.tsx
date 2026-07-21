import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { checkIfReadyToSend } from '../form-validation';
import { NotificationContext } from '../NotificationContext';
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
	const { notification, updateNotification } = useContext(NotificationContext);
	const { parameters, confirmSendModalOpen, isFetchingContent } = notification;

	if (!parameters) {
		return null;
	}
	const isReady = checkIfReadyToSend(notification);

	const sendNotification = () => {
		alert('send function placeholder');
	};

	return (
		<div
			css={{
				maxWidth: semanticSizing.input.maxWidthPx,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="labelFormCompactMd">Send</Typography>
			<Typography variant="helpTextFormMd">
				Before sending, review in the preview on the right
			</Typography>
			<Button
				onClick={() => {
					updateNotification({ type: 'set-show-confirm-send', isOpen: true });
				}}
				isDisabled={!isReady || !!confirmSendModalOpen || isFetchingContent}
				variant="primary"
				cssOverrides={
					isReady
						? undefined
						: css({
								backgroundColor: semanticColors.fill.disabledInverse,
								cursor: 'not-allowed',
							})
				}
			>
				{buttonText(parameters)}
			</Button>

			<Modal
				isOpen={confirmSendModalOpen}
				onOpenChange={(isOpen) =>
					updateNotification({ type: 'set-show-confirm-send', isOpen })
				}
			>
				<Dialog aria-label="confirm notification send">
					<Dialog.Dismiss ariaLabel="Close Modal" />
					<Dialog.Header>
						Are you sure you want to send the newsletter email?
					</Dialog.Header>
					<Dialog.Content>
						Sent newsletter emails cannot be undone
					</Dialog.Content>
					<Dialog.Buttons>
						<Button
							variant="tertiary"
							onPress={() => {
								updateNotification({
									type: 'set-show-confirm-send',
									isOpen: false,
								});
							}}
						>
							Cancel
						</Button>
						<Button onPress={sendNotification}>Confirm send</Button>
					</Dialog.Buttons>
				</Dialog>
			</Modal>
		</div>
	);
};
