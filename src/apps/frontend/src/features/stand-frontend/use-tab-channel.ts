import { useContext, useEffect } from 'react';
import { NotificationFormContext } from './NotificationContext';
import type { ChannelOption } from './types';

export const useTabChannel = (channel: ChannelOption): void => {
	const {
		notification: { parameters },
		updateNotification,
	} = useContext(NotificationFormContext);

	useEffect(() => {
		if (parameters?.type !== channel) {
			updateNotification({ type: 'set-channel', channel });
		}
	}, [parameters?.type, channel, updateNotification]);
};
