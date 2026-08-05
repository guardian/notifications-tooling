import type { ChannelOption } from '../features/stand-frontend/types';

const channelDescriptions = {
	email: 'email newsletter',
	push: 'app alert',
};

export const getChannelDescription = (channel?: ChannelOption) =>
	channel ? channelDescriptions[channel] : 'notification';

export const capitalise = (text: string) =>
	`${text.substring(0, 1).toUpperCase()}${text.substring(1).toLowerCase()}`;
