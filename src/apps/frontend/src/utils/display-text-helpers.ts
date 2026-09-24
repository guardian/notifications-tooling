import { NotificationChannel, notificationChannelNames } from '@models';
import type { ChannelOption } from '../types';

export const getChannelDescription = (channel?: ChannelOption) =>
	channel ? notificationChannelNames[channel].toLowerCase() : 'notification';

export const capitalise = (text: string) =>
	`${text.substring(0, 1).toUpperCase()}${text.substring(1).toLowerCase()}`;

export const getAlternateChannel = (channel?: ChannelOption) =>
	channel === NotificationChannel.Newsletter
		? NotificationChannel.AppPushNotification
		: NotificationChannel.Newsletter;

export const getAlternateChannelDescription = (channel?: ChannelOption) =>
	notificationChannelNames[getAlternateChannel(channel)].toLowerCase();
