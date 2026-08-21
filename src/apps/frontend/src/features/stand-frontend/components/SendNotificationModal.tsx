import { Button } from '@guardian/stand/Button';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { useContext } from 'react';
import { getChannelDescription } from '../../../util/display-text-helpers';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from '../api/schemas';
import { buildRequest } from '../build-request-payloads';
import { NotificationFormContext } from '../NotificationContext';
import type { SendingResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

// TEMP: app-alert sends have no request builder or backend contract yet, so
// resolve a stubbed success to reach the confirmation page. Remove once
// buildAppRequest and the push send path land.
const stubbedAppAlertResult: SendingResult = {
	ok: true,
	response: {
		notificationId: 'app-alert-local',
		status: 'accepted',
		plans: [{ channel: 'app-push', planId: 'local', status: 'accepted' }],
		statusUrl: '',
		cancellable: { cancelUrl: '', expiresAt: 0 },
	} satisfies SendNotificationResponse,
};

export const SendNotificationModal = () => {
	const { notification, updateNotification, sendNotification } = useContext(
		NotificationFormContext,
	);
	const { confirmSendModalOpen, isWaitingForSend } = notification;
	const sendNotificationRequest = buildRequest(notification);
	const isAppAlert = notification.parameters?.type === 'push';
	const channelDescription = getChannelDescription(
		notification.parameters?.type,
	);

	const handleSendingEmailNotification =
		(sendNotificationRequest: SendNotificationRequest) => () => {
			updateNotification({ type: 'waiting-for-send' });
			void sendNotification(sendNotificationRequest).then((result) => {
				updateNotification({ type: 'receive-send-result', result });
			});
		};

	const handleSendingAppAlert = () => {
		updateNotification({ type: 'waiting-for-send' });
		void Promise.resolve(stubbedAppAlertResult).then((result) => {
			updateNotification({ type: 'receive-send-result', result });
		});
	};

	const confirmSend = sendNotificationRequest
		? handleSendingEmailNotification(sendNotificationRequest)
		: isAppAlert
			? handleSendingAppAlert
			: undefined;
			
	const canConfirmSend = Boolean(confirmSend);

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
						isDisabled={isWaitingForSend || !canConfirmSend}
						icon={isWaitingForSend ? <LoadingSpinner /> : undefined}
						onPress={confirmSend}
					>
						Confirm send
					</Button>
				</Dialog.Buttons>
			</Dialog>
		</Modal>
	);
};
