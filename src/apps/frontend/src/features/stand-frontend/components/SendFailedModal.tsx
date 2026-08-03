import { semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { getChannelDescription } from '../../../util/display-text-helpers';
import { NotificationFormContext } from '../NotificationContext';
import type { NotificationState } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

const getFailure = (notification: NotificationState) => {
	const { sendingResult } = notification;
	if (sendingResult?.ok !== false) {
		return undefined;
	}
	if (sendingResult.requestFailed) {
		return {
			message: 'There was a connection issue. Try to send again.',
			canRetry: true,
		};
	}
	const { message } = sendingResult.response;
	return {
		message,
		canRetry: false,
	};
};

export const SendFailedModal = () => {
	const { notification, updateNotification, sendNotification } = useContext(
		NotificationFormContext,
	);

	const { isWaitingForSend } = notification;
	const failure = getFailure(notification);

	const handleRetry = () => {
		updateNotification({ type: 'waiting-for-send' });
		sendNotification(notification)
			.then((result) => {
				updateNotification({ type: 'receive-send-result', result });
			})
			.catch((err) => {
				console.error(err);
				updateNotification({
					type: 'receive-send-result',
					result: {
						ok: false,
						requestFailed: true,
					},
				});
			});
	};

	return (
		<Modal
			isOpen={!!failure}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					updateNotification({
						type: 'dismiss-send-error',
					});
				}
			}}
			theme={{
				overlay: {
					position: 'fixed',
				},
			}}
		>
			{failure && (
				<Dialog aria-label={`Dispatch failed: ${failure.message}`}>
					<Dialog.Dismiss ariaLabel="Close Modal" />
					<Dialog.Header>
						<InlineMessage level="error">
							<Typography
								variant="headingLg"
								theme={{ color: semanticColors.text.error }}
							>
								The {getChannelDescription(notification.parameters?.type)}{' '}
								couldn’t be sent
							</Typography>
						</InlineMessage>
					</Dialog.Header>
					<Dialog.Content>{failure.message}</Dialog.Content>
					<Dialog.Buttons theme={{ flexDirection: 'row' }}>
						{failure.canRetry ? (
							<Button
								isDisabled={isWaitingForSend}
								onPress={handleRetry}
								icon={isWaitingForSend ? <LoadingSpinner /> : undefined}
							>
								Try Again
							</Button>
						) : (
							<Button
								onPress={() => {
									updateNotification({
										type: 'dismiss-send-error',
									});
								}}
							>
								Done
							</Button>
						)}
					</Dialog.Buttons>
				</Dialog>
			)}
		</Modal>
	);
};
