import type { ChannelOption } from '../types';

const channelDescriptions = {
	newsletter: 'newsletter email',
	'app-push': 'app alert',
};

export const getChannelDescription = (channel?: ChannelOption) =>
	channel ? channelDescriptions[channel] : 'notification';

export const capitalise = (text: string) =>
	`${text.substring(0, 1).toUpperCase()}${text.substring(1).toLowerCase()}`;

export const getAlternateChannel = (channel?: ChannelOption) =>
	channel === 'newsletter' ? 'app-push' : 'newsletter';

export const getAlternateChannelDescription = (channel?: ChannelOption) =>
	channelDescriptions[getAlternateChannel(channel)];
