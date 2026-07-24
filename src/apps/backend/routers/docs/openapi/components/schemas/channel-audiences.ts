import { NotificationChannel } from '@config';
import { channelAudiences } from '../../../../channels';

/** A selectable audience segment exposed to the SPA: its id and human label. */
const segmentOptionSchema = {
	type: 'object',
	required: ['id', 'label'],
	properties: {
		id: {
			type: 'string',
			description: 'The public segment id referenced in a notification plan.',
		},
		label: {
			type: 'string',
			description: 'Human-readable segment name for display in the UI.',
		},
	},
} as const;

/** A channel's selectable audience: its list of segments. */
const channelAudienceSchema = {
	type: 'object',
	required: ['segments'],
	properties: {
		segments: {
			type: 'array',
			items: segmentOptionSchema,
		},
	},
} as const;

/**
 * The `GET /v1/channels/audiences` response body: the selectable audience
 * segments per channel the SPA uses to populate its audience pickers, keyed by
 * channel under `channels`. Only the public id and label are exposed; the
 * downstream addressing each id resolves to (Braze campaign / mobile-n10n
 * topic) is kept server-side.
 */
export const channelAudiencesSchema = {
	type: 'object',
	description: 'Per-channel audience segments (id + label), keyed by channel.',
	required: ['channels'],
	properties: {
		channels: {
			type: 'object',
			required: [
				NotificationChannel.AppPushNotification,
				NotificationChannel.Newsletter,
			],
			properties: {
				[NotificationChannel.AppPushNotification]: {
					...channelAudienceSchema,
					example:
						channelAudiences.channels[NotificationChannel.AppPushNotification],
				},
				[NotificationChannel.Newsletter]: {
					...channelAudienceSchema,
					example: channelAudiences.channels[NotificationChannel.Newsletter],
				},
			},
		},
	},
} as const;
