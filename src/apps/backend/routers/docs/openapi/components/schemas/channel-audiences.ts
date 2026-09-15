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

/** A selectable app-push edition within a topic type: its id and human label. */
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

/** A selectable app-push topic type: its id, label and selectable editions. */
const topicTypeOptionSchema = {
	type: 'object',
	required: ['id', 'label', 'editions'],
	properties: {
		id: {
			type: 'string',
			description: 'The public topic-type id referenced in a push plan topic.',
		},
		label: {
			type: 'string',
			description: 'Human-readable topic-type name for display in the UI.',
		},
		editions: {
			type: 'array',
			items: editionOptionSchema,
		},
	},
} as const;

/** The app-push channel's selectable audience: its topic types. */
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
 * each with their selectable `editions`. Only public ids and
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

const emailChannelConfigEntrySchema = {
	type: 'object',
	required: [
		'label',
		'brazeCampaignId',
		'emailRenderingNewsletterId',
		'campaignLive',
	],
	properties: {
		label: {
			type: 'string',
		},
		brazeCampaignId: {
			type: 'string',
		},
		emailRenderingNewsletterId: {
			type: 'string',
		},
		campaignLive: {
			type: ['boolean', 'null'],
			description:
				'Whether the Braze campaign is live, or null when unavailable.',
		},
		data: {
			type: 'object',
			required: ['name', 'archived', 'enabled', 'draft', 'schedule_type'],
			properties: {
				name: { type: 'string' },
				created_at: { type: 'string' },
				updated_at: { type: 'string' },
				description: { type: 'string' },
				archived: { type: 'boolean' },
				enabled: { type: 'boolean' },
				draft: { type: 'boolean' },
				schedule_type: { type: 'string' },
				channels: {
					type: 'array',
					items: { type: 'string' },
				},
			},
		},
		status: {
			type: 'integer',
			description: 'The HTTP status returned by Braze, when available.',
		},
		errorMessage: {
			type: 'string',
			description: 'The Braze error message, when the campaign lookup fails.',
		},
	},
} as const;

export const emailChannelConfigSchema = {
	type: 'object',
	description: 'Email configuration and Braze status, keyed by edition.',
	required: ['UK', 'US', 'AU'],
	properties: {
		UK: emailChannelConfigEntrySchema,
		US: emailChannelConfigEntrySchema,
		AU: emailChannelConfigEntrySchema,
	},
} as const;
