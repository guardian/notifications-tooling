import { semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import type { ApiErrorFailure } from '../../../api/errors';
import { getChannelDescription } from '../../../util/display-text-helpers';
import { NotificationFormContext } from '../NotificationContext';
import type { NotificationState } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

const deriveUserFacingMessage = (
	error: ApiErrorFailure,
	messageFromApi: string,
	channelDescription: string,
): ReactNode => {
	switch (error) {
		case 'unauthenticated':
		case 'forbidden':
			return `You don't have the correct authorisation to send ${channelDescription}s}`;
		default:
			return messageFromApi; // TO DO - we don't have user-facing messaging for these cases
	}
};

const getFailure = (notification: NotificationState) => {
	const { sendingResult } = notification;
	if (sendingResult?.ok !== false) {
		return undefined;
	}

	const channelDescription = getChannelDescription(
		notification.parameters?.type,
	);

	if (sendingResult.requestFailed) {
		return {
			title: 'There was a problem',
			message:
				'The newsletter email could not be sent at this time. Try again.',
			canRetry: true,
		};
	}
	const { message, failure } = sendingResult.response;
	return {
		title: `The ${channelDescription} couldn't be sent`,
		message: deriveUserFacingMessage(failure, message, channelDescription),
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
				<Dialog aria-label={`Dispatch failed: ${failure.title}`}>
					<Dialog.Dismiss ariaLabel="Close Modal" />
					<Dialog.Header>
						<InlineMessage level="error">
							<Typography
								variant="headingLg"
								theme={{ color: semanticColors.text.error }}
							>
								{failure.title}
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
