import { newsletterSegmentIds, NotificationChannel } from '@config';

/**
 * Named request-body examples for `POST /v1/notification-tests`, referenced from
 * the path via `#/components/examples/*`. Ids are pulled from `@config` so the
 * examples cannot drift from the accepted values.
 */
export const notificationTestNewsletterExample = {
	summary: 'Test newsletter to explicit recipients',
	value: {
		idempotencyKey: 'test-2f1c9a7e-8b0d-4a3e-9c1b-7d6e5f4a3b2c',
		content: {
			items: {
				'lead-story': {
					type: NotificationChannel.Newsletter,
					title: 'Your morning briefing',
					body: 'The three stories shaping the day.',
					link: 'https://www.theguardian.com/environment/2026/jul/20/global-climate-deal',
				},
			},
		},
		channels: {
			[NotificationChannel.Newsletter]: {
				audience: {
					type: 'email',
					items: ['newsletters.test@theguardian.com'],
				},
				variants: [newsletterSegmentIds[0]],
				compose: {
					items: ['lead-story'],
					subject: '[TEST] Your morning briefing',
				},
			},
		},
		sender: 'notifications-tooling-spa/v1',
		options: { dryRun: false },
	},
} as const;

export const notificationTestAppPushExample = {
	summary: 'Test app-push to an existing Braze user',
	value: {
		idempotencyKey: 'test-9c1d5b2a-1f3e-4b7a-8c2d-5e6f7a8b9c0d',
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
					type: 'email',
					items: ['editor@theguardian.com'],
				},
				compose: { use: 'lead-story' },
			},
		},
		sender: 'notifications-tooling-spa/v1',
		options: { dryRun: false },
	},
} as const;
