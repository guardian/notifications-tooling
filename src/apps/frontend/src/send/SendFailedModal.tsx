import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Dialog, Modal } from '@guardian/stand/Modal';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import type { ApiError } from '../api-client/errors';
import { NotificationFormContext } from '../compose/NotificationContext';
import { useSendNotification } from '../hooks/use-send-notification';
import type {
	ChannelAudienceResponse,
	NotificationDispatch,
	NotificationResource,
	SendNotificationRequest,
} from '../schemas';
import {
	FALLBACK_NEWSLETTER_SEGMENTS,
	FALLBACK_TOPIC_TYPES,
} from '../segment/audience-fallbacks';
import { useChannelAudiences } from '../segment/useChannelAudiences';
import type { ChannelOption } from '../types';
import type { NotificationState } from '../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { getChannelDescription } from '../utils/display-text-helpers';

const formatDispatchTarget = (
	requested: NotificationDispatch['requested'],
	audiences?: ChannelAudienceResponse,
): string => {
	if (requested.channel === 'newsletter') {
		const segments = audiences?.channels.newsletter.segments ?? [];
		return (
			segments.find(({ id }) => id === requested.segment)?.label ??
			FALLBACK_NEWSLETTER_SEGMENTS.find(({ id }) => id === requested.segment)
				?.label ??
			requested.segment
		);
	}

	const topicTypes = audiences?.channels['app-push'].topicTypes ?? [];
	const topic = topicTypes.find(({ id }) => id === requested.topicType);
	const fallbackTopic = FALLBACK_TOPIC_TYPES.find(
		({ id }) => id === requested.topicType,
	);

	return requested.editions
		.map(
			(edition) =>
				topic?.editions.find(({ id }) => id === edition)?.label ??
				fallbackTopic?.editions.find(({ id }) => id === edition)?.label ??
				edition,
		)
		.join(', ');
};

const deriveDispatchFailureMessage = (
	notification: NotificationResource,
	channel: ChannelOption,
	channelDescription: string,
	audiences?: ChannelAudienceResponse,
): ReactNode => {
	const successfulTargets = notification.dispatches
		.filter(({ status }) => status === 'success')
		.map(({ requested }) => formatDispatchTarget(requested, audiences));
	const failedTargets = notification.dispatches
		.filter(({ status }) => status === 'failure')
		.map(({ requested }) => formatDispatchTarget(requested, audiences));
	const upstreamService =
		channel === 'push'
			? 'mobile notification service'
			: 'newsletter delivery service';

	return (
		<>
			<Typography element="p">
				{notification.dispatches.length === 0
					? `We couldn't confirm whether the ${channelDescription} was sent.`
					: notification.status === 'partially_delivered'
						? `The ${upstreamService} failed for some destinations.`
						: `The ${upstreamService} failed. No ${channelDescription} was sent.`}
			</Typography>
			<div
				css={{
					display: 'flex',
					flexDirection: 'column',
					gap: semanticSpacing.stackXxs,
					marginTop: semanticSpacing.stackSm,
				}}
			>
				{successfulTargets.length > 0 && (
					<Typography
						element="p"
						theme={{ color: semanticColors.text.success }}
					>
						Sent to: {successfulTargets.join(', ')}
					</Typography>
				)}
				{failedTargets.length > 0 && (
					<Typography element="p" theme={{ color: semanticColors.text.error }}>
						Not sent to: {failedTargets.join(', ')}
					</Typography>
				)}
				<Typography
					element="p"
					variant="bodySm"
					css={{ marginTop: semanticSpacing.stackSm }}
				>
					Reference: {notification.id}
				</Typography>
			</div>
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
	audiences?: ChannelAudienceResponse,
) => {
	const { sendFailure } = notification;
	if (!sendFailure) {
		return undefined;
	}

	const channelDescription = getChannelDescription(channel);
	if (sendFailure.failure === 'dispatch-fail') {
		const hasNoDispatchOutcomes =
			sendFailure.notification.dispatches.length === 0;

		return {
			title: hasNoDispatchOutcomes
				? 'Something went wrong'
				: sendFailure.notification.status === 'partially_delivered'
					? `The ${channelDescription} was only partially sent`
					: `The ${channelDescription} wasn't sent`,
			message: deriveDispatchFailureMessage(
				sendFailure.notification,
				channel,
				channelDescription,
				audiences,
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
					<Typography
						element="p"
						variant="bodySm"
						css={{ marginTop: semanticSpacing.stackSm }}
					>
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
	const { data: audiences } = useChannelAudiences();

	const { isWaitingForSend, pendingRequest } = notification;
	const failure = getFailure(notification, channel, audiences);

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
