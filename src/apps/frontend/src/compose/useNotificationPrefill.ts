import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { ChannelOption } from '../types';
import { parseNotificationPrefill } from './notification-prefill';

export const useNotificationPrefill = <Channel extends ChannelOption>(
	channel: Channel,
) => {
	const location = useLocation();
	const state: unknown = location.state;

	return useMemo(
		() => parseNotificationPrefill(state, channel),
		[channel, state],
	);
};
