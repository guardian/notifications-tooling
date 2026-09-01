import { useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { SendNotificationRequest } from './api/schemas';
import { notificationHistoryQueryKey } from './api/useNotificationHistory';
import { NotificationFormContext } from './NotificationContext';
import { notificationRoutes } from './routes';

export const useSendNotification = () => {
	const { channel, sendNotification, updateNotification } = useContext(
		NotificationFormContext,
	);
	const { setValue } = useFormContext<{ dispatchId?: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

    return (request: SendNotificationRequest) => {
        updateNotification({ type: 'waiting-for-send' });
        void sendNotification(request).then((result) => {
            if (!result.success) {
                updateNotification({
                    type: 'receive-send-failure',
                    failure: result.failure,
                });
                return;
            }
			setValue('dispatchId', result.data.id);
			void queryClient.invalidateQueries({
				queryKey: notificationHistoryQueryKey,
			});
			updateNotification({ type: 'complete-send' });
			void navigate(notificationRoutes[channel].report);
		});
	};
};
