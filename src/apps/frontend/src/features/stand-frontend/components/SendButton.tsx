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
import { NotificationFormContext } from '../NotificationContext';
import type { NotificationState } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

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
	const { notification, updateNotification, sendNotification } = useContext(
		NotificationFormContext,
	);
	const {
		parameters,
		confirmSendModalOpen,
		isFetchingContent,
		isWaitingForSend,
	} = notification;

	if (!parameters) {
		return null;
	}
	const isReady = checkIfReadyToSend(notification);

	const handleSending = () => {
		updateNotification({ type: 'waiting-for-send' });
		sendNotification(notification)
			.then((result) => {
				updateNotification({ type: 'receive-send-result', result });
			})
			.catch((err) => {
				console.error(err);
			});
	};

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
				onOpenChange={(isOpen) => {
					if (isWaitingForSend) {
						return;
					}
					updateNotification({ type: 'set-show-confirm-send', isOpen });
				}}
				theme={{
					overlay: {
						position: 'fixed',
					},
				}}
			>
				<Dialog aria-label="confirm notification send">
					<Dialog.Dismiss ariaLabel="Close Modal" />
					<Dialog.Header>
						Are you sure you want to send the newsletter email?
					</Dialog.Header>
					<Dialog.Content>
						Sent newsletter emails cannot be undone
					</Dialog.Content>
					<Dialog.Buttons theme={{ flexDirection: 'row' }}>
						<Button
							isDisabled={isWaitingForSend}
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
						<Button
							isDisabled={isWaitingForSend}
							icon={isWaitingForSend ? <LoadingSpinner /> : undefined}
							onPress={handleSending}
						>
							Confirm send
						</Button>
					</Dialog.Buttons>
				</Dialog>
			</Modal>
		</div>
	);
};
