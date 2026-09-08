import { semanticColors } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import type { ApiError } from '../api-client/errors';
import { NotificationFormContext } from '../compose/NotificationContext';
import { useSendNotification } from '../hooks/use-send-notification';
import type { SendNotificationRequest } from '../schemas';
import type { NotificationResource } from '../schemas';
import type { ChannelOption } from '../types';
import type { NotificationState } from '../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getChannelDescription } from '../utils/display-text-helpers';

const formatDispatchTarget = (target: string): string => {
	const editions = target.split('/').at(-1) ?? target;
	return editions
		.split(',')
		.map((edition) =>
			edition.length <= 3
				? edition.toUpperCase()
				: edition.replaceAll('-', ' '),
		)
		.join(', ');
};

const deriveDispatchFailureMessage = (
	notification: NotificationResource,
	channelDescription: string,
): ReactNode => {
	const successfulTargets = notification.dispatches
		.filter(({ status }) => status === 'success')
		.map(({ target }) => formatDispatchTarget(target));
	const failedTargets = notification.dispatches
		.filter(({ status }) => status === 'failure')
		.map(({ target }) => formatDispatchTarget(target));
	const upstreamService =
		notification.dispatches[0]?.channel === 'app-push'
			? 'mobile notification service'
			: 'newsletter delivery service';

	return (
		<>
			<Typography element="p">
				{notification.dispatches.length === 0
					? `The delivery could not be started. No ${channelDescription} was sent.`
					: notification.status === 'partially_delivered'
						? `The ${upstreamService} failed for some destinations.`
						: `The ${upstreamService} failed. No ${channelDescription} was sent.`}
			</Typography>
			{successfulTargets.length > 0 && (
				<Typography element="p">
					Sent to: {successfulTargets.join(', ')}
				</Typography>
			)}
			{failedTargets.length > 0 && (
				<Typography element="p" variant="bodyBoldSm">
					Not sent to: {failedTargets.join(', ')}
				</Typography>
			)}
			<Typography element="p" variant="bodySm">
				Reference: {notification.id}
			</Typography>
		</>
	);
};

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
	const { sendFailure } = notification;
	if (!sendFailure) {
		return undefined;
	}

	const channelDescription = getChannelDescription(channel);
	if (sendFailure.failure === 'dispatch-fail') {
		return {
			title:
				sendFailure.notification.status === 'partially_delivered'
					? `The ${channelDescription} was only partially sent`
					: `The ${channelDescription} wasn't sent`,
			message: deriveDispatchFailureMessage(
				sendFailure.notification,
				channelDescription,
			),
			canRetry: false,
		};
	}

	const { loginUrl, requestId } = sendFailure;
	return {
		title: deriveErrorTitle(sendFailure, channelDescription),
		message: (
			<>
				{deriveUserFacingMessage(sendFailure, channelDescription)}
				{requestId && (
					<Typography element="p" variant="bodySm">
						Reference: {requestId}
					</Typography>
				)}
			</>
		),
		canRetry: checkIfCanRetry(sendFailure),
		loginUrl,
	};
};

export const SendFailedModal = () => {
	const { channel, notification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const sendNotification = useSendNotification();

	const { isWaitingForSend, pendingRequest } = notification;
	const failure = getFailure(notification, channel);

	const handleRetry =
		(sendNotificationRequest: SendNotificationRequest) => () =>
			sendNotification(sendNotificationRequest);

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
