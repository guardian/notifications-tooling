import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { useContext } from 'react';
import { NotificationFormContext } from '../compose/NotificationContext';
import { useSendNotification } from '../hooks/use-send-notification';
import type { SendNotificationRequest } from '../schemas';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getChannelDescription } from '../utils/display-text-helpers';

export const SendNotificationModal = () => {
	const { channel, notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const sendNotification = useSendNotification();
	const { confirmSendModalOpen, isWaitingForSend, pendingRequest } =
		notification;
	const channelDescription = getChannelDescription(channel);

	const handleSending =
		(sendNotificationRequest: SendNotificationRequest) => () =>
			sendNotification(sendNotificationRequest);

	return (
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
					Are you sure you want to send the {channelDescription}?
				</Dialog.Header>
				<Dialog.Content>
					Sent {channelDescription}s cannot be undone
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
						isDisabled={isWaitingForSend || !pendingRequest}
						icon={isWaitingForSend ? <LoadingSpinner /> : undefined}
						onPress={pendingRequest ? handleSending(pendingRequest) : undefined}
					>
						Confirm send
					</Button>
				</Dialog.Buttons>
			</Dialog>
		</Modal>
	);
};
