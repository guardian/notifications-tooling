import { semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import type { ApiError } from '../../../api/errors';
import { getChannelDescription } from '../../../util/display-text-helpers';
import type { SendNotificationRequest } from '../api/schemas';
import { NotificationFormContext } from '../NotificationContext';
import type { ChannelOption } from '../types';
import type { NotificationState } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

const deriveUserFacingMessage = (
	apiError: ApiError,
	channelDescription: string,
): ReactNode => {
	switch (apiError.failure) {
		case 'forbidden':
			return `You don't have the correct authorisation to send ${channelDescription}s`;
		case 'unauthenticated':
			return <Typography>Your login has expired.</Typography>;
		case 'json-parse-fail':
		case 'schema-parse-fail':
			return (
				<>
					<Typography element="p">
						Could not understand the response:
					</Typography>
					<Typography element="p" variant="bodyBoldSm">
						{apiError.message}
					</Typography>
				</>
			);
		case 'non-2xx-response': // TO DO - parse the details array to return more specific info
		case 'fetch-fail':
		case 'timeout':
		default:
			return checkIfCanRetry(apiError) ? (
				<Typography>
					The {channelDescription} could not be sent at this time. Try again.
				</Typography>
			) : (
				<Typography>The {channelDescription} could not be sent.</Typography>
			);
	}
};

const deriveErrorTitle = (apiError: ApiError, channelDescription: string) => {
	switch (apiError.failure) {
		case 'fetch-fail':
			return 'There was a problem';
		case 'json-parse-fail':
		case 'schema-parse-fail':
			return 'Communication Failure';
		case 'non-2xx-response':
		case 'timeout':
		case 'unauthenticated':
		case 'forbidden':
			return `The ${channelDescription} couldn't be sent`;
	}
};

const checkIfCanRetry = (apiError: ApiError) => {
	const { failure, status } = apiError;
	switch (failure) {
		case 'fetch-fail':
		case 'unauthenticated':
		case 'timeout':
			return true;
		case 'json-parse-fail':
		case 'schema-parse-fail':
		case 'forbidden':
			return false;
		case 'non-2xx-response':
			return status != null && status >= 500;
		default:
			return false;
	}
};

const getFailure = (
	notification: NotificationState,
	channel: ChannelOption,
) => {
	const { sendingResult } = notification;
	if (sendingResult?.ok !== false) {
		return undefined;
	}

	const channelDescription = getChannelDescription(channel);

	const { loginUrl, details } = sendingResult.response;
	return {
		title: deriveErrorTitle(sendingResult.response, channelDescription),
		message: deriveUserFacingMessage(
			sendingResult.response,
			channelDescription,
		),
		canRetry: checkIfCanRetry(sendingResult.response),
		loginUrl,
		details,
	};
};

export const SendFailedModal = () => {
	const { channel, notification, updateNotification, sendNotification } =
		useContext(NotificationFormContext);

	const { isWaitingForSend, pendingRequest } = notification;
	const failure = getFailure(notification, channel);

	const handleRetry =
		(sendNotificationRequest: SendNotificationRequest) => () => {
			updateNotification({ type: 'waiting-for-send' });
			void sendNotification(sendNotificationRequest).then((result) => {
				updateNotification({ type: 'receive-send-result', result });
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
						{failure.canRetry && !!pendingRequest ? (
							<Button
								isDisabled={isWaitingForSend}
								onPress={handleRetry(pendingRequest)}
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
