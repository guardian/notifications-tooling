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

/** The newsletter channel's selectable audience: its list of segments. */
const newsletterAudienceSchema = {
	type: 'object',
	required: ['segments'],
	properties: {
		segments: {
			type: 'array',
			items: segmentOptionSchema,
		},
	},
} as const;

/** A selectable app-push edition within an alert type: its id and human label. */
const editionOptionSchema = {
	type: 'object',
	required: ['id', 'label'],
	properties: {
		id: {
			type: 'string',
			description: 'The public edition id referenced in a push plan topic.',
		},
		label: {
			type: 'string',
			description: 'Human-readable edition name for display in the UI.',
		},
	},
} as const;

/** A selectable app-push alert type: its id, label and selectable editions. */
const topicTypeOptionSchema = {
	type: 'object',
	required: ['id', 'label', 'editions'],
	properties: {
		id: {
			type: 'string',
			description: 'The public alert-type id referenced in a push plan topic.',
		},
		label: {
			type: 'string',
			description: 'Human-readable alert-type name for display in the UI.',
		},
		editions: {
			type: 'array',
			items: editionOptionSchema,
		},
	},
} as const;

/** The app-push channel's selectable audience: its alert types (topic types). */
const appPushAudienceSchema = {
	type: 'object',
	required: ['topicTypes'],
	properties: {
		topicTypes: {
			type: 'array',
			items: topicTypeOptionSchema,
		},
	},
} as const;

/**
 * The `GET /v1/channels/audiences` response body: the selectable audiences per
 * channel the SPA uses to populate its audience pickers, keyed by channel under
 * `channels`. Newsletter exposes `segments`; app-push exposes `topicTypes`
 * (alert types) each with their selectable `editions`. Only public ids and
 * labels are exposed; the downstream addressing each selection resolves to
 * (Braze campaign / mobile-n10n topic) is kept server-side.
 */
export const channelAudiencesSchema = {
	type: 'object',
	description: 'Per-channel selectable audiences, keyed by channel.',
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
					...appPushAudienceSchema,
					example:
						channelAudiences.channels[NotificationChannel.AppPushNotification],
				},
				[NotificationChannel.Newsletter]: {
					...newsletterAudienceSchema,
					example: channelAudiences.channels[NotificationChannel.Newsletter],
				},
			},
		},
	},
} as const;
