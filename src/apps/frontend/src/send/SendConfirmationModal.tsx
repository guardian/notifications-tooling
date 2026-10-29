import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { useContext } from 'react';
import { NotificationFormContext } from '../compose/NotificationFormContext';
import { useSendNotification } from '../hooks/useSendNotification';
import type { SendNotificationRequest } from '../schemas';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getChannelDescription } from '../utils/display-text-helpers';

export const SendConfirmationModal = () => {
	const { channel, composerState, updateComposerState } = useContext(
		NotificationFormContext,
	);
	const sendNotification = useSendNotification();
	const { isSendConfirmationOpen, isWaitingForSend, pendingRequest } =
		composerState;
	const channelDescription = getChannelDescription(channel);

	const handleConfirmSend =
		(sendNotificationRequest: SendNotificationRequest) => () =>
			sendNotification(sendNotificationRequest);

	return (
		<Modal
			isOpen={isSendConfirmationOpen}
			onOpenChange={(isOpen) => {
				if (isWaitingForSend) {
					return;
				}
				updateComposerState({ type: 'set-send-confirmation-open', isOpen });
			}}
			theme={{
				overlay: {
					position: 'fixed',
					overflow: 'auto',
				},
			}}
		>
			<Dialog aria-label="confirm notification send">
				<Dialog.Dismiss ariaLabel="Close Modal" />
				<Dialog.Header>
					Are you sure you want to send the {channelDescription}?
				</Dialog.Header>
				<Dialog.Content>
					Sent {channelDescription}s cannot be undone.
				</Dialog.Content>
				<Dialog.Buttons theme={{ flexDirection: 'row' }}>
					<Button
						isDisabled={isWaitingForSend}
						variant="tertiary"
						onPress={() => {
							updateComposerState({
								type: 'set-send-confirmation-open',
								isOpen: false,
							});
						}}
					>
						Cancel
					</Button>
					<Button
						isDisabled={isWaitingForSend || !pendingRequest}
						icon={isWaitingForSend ? <LoadingSpinner /> : undefined}
						onPress={
							pendingRequest ? handleConfirmSend(pendingRequest) : undefined
						}
					>
						Confirm send
					</Button>
				</Dialog.Buttons>
			</Dialog>
		</Modal>
	);
};
