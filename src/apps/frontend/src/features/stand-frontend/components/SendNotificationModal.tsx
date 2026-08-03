import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { useContext } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { LoadingSpinner } from './LoadingSpinner';



export const SendNotificationModal = () => {
	const { notification, updateNotification, sendNotification } = useContext(
		NotificationFormContext,
	);
	const {
		confirmSendModalOpen,
		isWaitingForSend,
	} = notification;



	const handleSending = () => {
		updateNotification({ type: 'waiting-for-send' });
		sendNotification(notification)
			.then((result) => {
				updateNotification({ type: 'receive-send-result', result });
			})
			.catch((err) => {
				console.error(err);
				updateNotification({
					type: 'receive-send-result',
					result: { ok: false },
				});
			});
	};

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
					Are you sure you want to send the newsletter email?
				</Dialog.Header>
				<Dialog.Content>Sent newsletter emails cannot be undone</Dialog.Content>
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
	);
};
