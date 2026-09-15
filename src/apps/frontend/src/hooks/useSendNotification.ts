import { useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { NotificationFormContext } from '../compose/NotificationFormContext';
import { notificationRoutes } from '../routes';
import type { SendNotificationRequest } from '../schemas';
import { notificationHistoryQueryKey } from './useNotificationHistory';

export const useSendNotification = () => {
	const { channel, sendNotification, dispatchComposerAction } = useContext(
		NotificationFormContext,
	);
	const { setValue } = useFormContext<{ notificationId?: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return (request: SendNotificationRequest) => {
		dispatchComposerAction({ type: 'waiting-for-send' });
		void sendNotification(request).then((result) => {
			if (!result.success) {
				dispatchComposerAction({
					type: 'receive-send-failure',
					failure: result.failure,
				});
				return;
			}
			setValue('notificationId', result.data.id);
			void queryClient.invalidateQueries({
				queryKey: notificationHistoryQueryKey,
			});
			dispatchComposerAction({ type: 'complete-send' });
			void navigate(notificationRoutes[channel].report);
		});
	};
};
