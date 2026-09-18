import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createNotificationPrefillState } from '../compose/notification-prefill';
import { NotificationFormContext } from '../compose/NotificationFormContext';
import { notificationRoutes } from '../routes';
import type { SendNotificationRequest } from '../schemas';
import type { SendNotificationResult } from '../utils/send-notification';
import { notificationHistoryQueryKey } from './useNotificationHistory';

export const invalidateNotificationHistoryAfterSend = (
	queryClient: QueryClient,
	result: SendNotificationResult,
) => {
	if (!result.success && result.failure.failure !== 'dispatch-fail') {
		return Promise.resolve();
	}

	return queryClient.invalidateQueries({
		queryKey: notificationHistoryQueryKey,
		refetchType: 'all',
	});
};

export const useSendNotification = () => {
	const { channel, sendNotification, updateComposerState } = useContext(
		NotificationFormContext,
	);
	const { setValue } = useFormContext<{ notificationId?: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return (request: SendNotificationRequest) => {
		updateComposerState({ type: 'waiting-for-send' });
		void sendNotification(request).then((result) => {
			void invalidateNotificationHistoryAfterSend(queryClient, result);

			if (!result.success) {
				updateComposerState({
					type: 'receive-send-failure',
					failure: result.failure,
				});
				return;
			}
			setValue('notificationId', result.data.id);
			updateComposerState({ type: 'complete-send' });
			const leadStory = request.content.items['lead-story'];
			void navigate(notificationRoutes[channel].report, {
				state: createNotificationPrefillState(channel, {
					articleUrl: leadStory?.link,
				}),
			});
		});
	};
};
