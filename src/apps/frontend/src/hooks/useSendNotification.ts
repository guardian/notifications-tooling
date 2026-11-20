import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../api-client/errors';
import { NotificationFormContext } from '../compose/NotificationFormContext';
import { PreviousSendContext } from '../previous-send/PreviousSendContext';
import { notificationRoutes, withArticleUrl } from '../routes';
import type { SendNotificationRequest } from '../schemas';
import { TelemetryContext } from '../telemetry/TelemetryContext';
import { TelemetryEvent } from '../telemetry/telemetryService';
import type { SendNotificationResult } from '../utils/send-notification';
import { notificationHistoryQueryKey } from './useNotificationHistory';
import { notificationSendersQueryKey } from './useNotificationSenders';

export const invalidateNotificationHistoryAfterSend = (
	queryClient: QueryClient,
	result: SendNotificationResult,
) => {
	if (!result.success && result.failure.failure !== 'dispatch-fail') {
		return Promise.resolve();
	}

	return Promise.all([
		queryClient.invalidateQueries({
			queryKey: notificationHistoryQueryKey,
			refetchType: 'all',
		}),
		queryClient.invalidateQueries({
			queryKey: notificationSendersQueryKey,
			refetchType: 'all',
		}),
	]);
};

export const useSendNotification = () => {
	const { channel, sendNotification, updateComposerState } = useContext(
		NotificationFormContext,
	);
	const { setPreviousSend } = useContext(PreviousSendContext);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const telemetry = useContext(TelemetryContext);

	return async (request: SendNotificationRequest) => {
		updateComposerState({ type: 'waiting-for-send' });
		const { idempotencyKey } = request;
		telemetry.sendEvent(TelemetryEvent.SendNotificationEvent, {
			idempotencyKey,
			channel,
		});
		let result: SendNotificationResult;
		try {
			result = await sendNotification(request);
		} catch (cause) {
			console.error('Unexpected notification send failure', {
				cause,
				idempotencyKey,
				channel,
			});
			result = {
				success: false,
				failure:
					cause instanceof ApiError
						? cause
						: new ApiError({
								message: 'Could not confirm whether the notification was sent',
								failure: 'fetch-fail',
								cause,
							}),
			};
		}
		void invalidateNotificationHistoryAfterSend(queryClient, result);

		if (!result.success) {
			telemetry.sendEvent(TelemetryEvent.FailedNotificationEvent, {
				idempotencyKey,
				channel,
				failure: result.failure.failure,
			});
			updateComposerState({
				type: 'receive-send-failure',
				failure: result.failure,
			});
			return;
		}
		setPreviousSend({
			notificationId: result.data.id,
		});
		telemetry.sendEvent(TelemetryEvent.SuccesfulNotificationEvent, {
			idempotencyKey,
			channel,
			notificationId: result.data.id,
		});
		updateComposerState({ type: 'complete-send' });
		const leadStory = request.content.items['lead-story'];
		void navigate(
			withArticleUrl(notificationRoutes[channel].report, leadStory?.link ?? ''),
		);
	};
};
