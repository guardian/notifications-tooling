import { NotificationChannel, notificationChannelNames } from '@models';
import type { ChannelOption } from '../types';

export const getChannelDescription = (channel?: ChannelOption) =>
	channel ? notificationChannelNames[channel].toLowerCase() : 'notification';

export const capitalise = (text: string) =>
	`${text.substring(0, 1).toUpperCase()}${text.substring(1).toLowerCase()}`;

export const getSenderDisplayName = (email: string): string => {
	const [senderName] = email.split('@');
	const names = senderName?.split(/[._-]+/).filter(Boolean) ?? [];
	return names.length === 0 ? email : names.map(capitalise).join(' ');
};

export const getSenderInitials = (email: string): string =>
	getSenderDisplayName(email)
		.split(' ')
		.map((name) => name[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

export const getAlternateChannel = (channel?: ChannelOption) =>
	channel === NotificationChannel.Newsletter
		? NotificationChannel.AppPushNotification
		: NotificationChannel.Newsletter;

export const getAlternateChannelDescription = (channel?: ChannelOption) =>
	notificationChannelNames[getAlternateChannel(channel)].toLowerCase();
