import {
	appPushTopicTypeIds,
	newsletterSegmentIds,
	NotificationChannel,
} from '@config';

/**
 * Named request-body examples for `POST /v1/notifications`, referenced from the
 * path via `#/components/examples/*`. Ids are pulled from `@config` so the
 * examples cannot drift from the accepted values.
 */
export const notificationSendNewsletterExample = {
	summary: 'Newsletter to a configured segment',
	value: {
		idempotencyKey: '2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
		content: {
			items: {
				'lead-story': {
					type: NotificationChannel.Newsletter,
					title: 'Your morning briefing',
					body: 'The three stories shaping the day, plus what to keep an eye on.',
					link: 'https://www.theguardian.com/environment/2026/jul/20/global-climate-deal',
				},
			},
		},
		channels: {
			[NotificationChannel.Newsletter]: {
				audience: { type: 'segment', items: [newsletterSegmentIds[0]] },
				compose: { items: ['lead-story'], subject: 'Your morning briefing' },
			},
		},
		sender: 'editorial-newsletters',
		options: { dryRun: false, scheduledFor: null },
	},
} as const;

export const notificationSendAppPushExample = {
	summary: 'App-push to a topic edition',
	value: {
		idempotencyKey: '9c1d5b2a-1f3e-4b7a-8c2d-5e6f7a8b9c0d',
		content: {
			items: {
				'lead-story': {
					type: NotificationChannel.AppPushNotification,
					title: 'Breaking news',
					body: 'Historic global climate deal reached at the COP summit',
					link: 'https://www.theguardian.com/environment/2026/jul/20/global-climate-deal',
				},
			},
		},
		channels: {
			[NotificationChannel.AppPushNotification]: {
				audience: {
					type: 'topic',
					items: [{ type: appPushTopicTypeIds[0], name: 'uk' }],
				},
				compose: { use: 'lead-story' },
			},
		},
		sender: 'editorial-mobile',
		options: { dryRun: false, scheduledFor: null },
	},
} as const;
