import { NotificationChannel } from '@config';

/**
 * The delivery channel a notification (or plan) targets. Referenced via
 * `#/components/schemas/NotificationChannel`.
 */
export const notificationChannelSchema = {
	type: 'string',
	description: 'The delivery channel a notification targets.',
	enum: Object.values(NotificationChannel),
} as const;
