/**
 * Maps public, channel-agnostic segment ids (surfaced to the FE and, in future,
 * served by `GET /v1/audiences`) to the internal downstream addressing the
 * broker resolves them to: Braze campaigns for newsletters, mobile-n10n topics
 * for push. These internals are kept out of the public
 * `POST /v1/notifications` contract, which references segment ids only.
 * Hard-coded stub until resolved from the downstream services.
 */

export interface NewsletterSegment {
	label: string;
	brazeCampaignId: string;
}

export const newsletterSegments = {
	'morning-briefing': {
		label: 'Morning briefing',
		brazeCampaignId: 'morning-briefing',
	},
	'first-edition': {
		label: 'First edition',
		brazeCampaignId: 'first-edition',
	},
	'editorial-breaking-news': {
		label: 'Editorial breaking news',
		brazeCampaignId: 'editorial-breaking-news',
	},
} as const satisfies Record<string, NewsletterSegment>;

export type NewsletterSegmentId = keyof typeof newsletterSegments;

export interface MobileN10nTopic {
	type: string;
	name: string;
}

export interface AppPushNotificationSegment {
	label: string;
	mobileN10nTopic: MobileN10nTopic;
}

/**
 * Push segments mirror the topics `guardian/facia-tool`'s Breaking News tool
 * emits, plus the registered `newsstand` topic. `test` is a catch-all used
 * while push is wired up end to end.
 */
export const appPushNotificationSegments = {
	'breaking-news-uk': {
		label: 'Breaking news UK',
		mobileN10nTopic: { type: 'breaking', name: 'uk' },
	},
	'breaking-news-us': {
		label: 'Breaking news US',
		mobileN10nTopic: { type: 'breaking', name: 'us' },
	},
	'breaking-news-au': {
		label: 'Breaking news AU',
		mobileN10nTopic: { type: 'breaking', name: 'au' },
	},
	'breaking-news-international': {
		label: 'Breaking news International',
		mobileN10nTopic: { type: 'breaking', name: 'international' },
	},
	'breaking-news-europe': {
		label: 'Breaking news Europe',
		mobileN10nTopic: { type: 'breaking', name: 'europe' },
	},
	'breaking-news-uk-sport': {
		label: 'Breaking news UK sport',
		mobileN10nTopic: { type: 'breaking', name: 'uk-sport' },
	},
	'breaking-news-us-sport': {
		label: 'Breaking news US sport',
		mobileN10nTopic: { type: 'breaking', name: 'us-sport' },
	},
	'breaking-news-au-sport': {
		label: 'Breaking news AU sport',
		mobileN10nTopic: { type: 'breaking', name: 'au-sport' },
	},
	'breaking-news-international-sport': {
		label: 'Breaking news International sport',
		mobileN10nTopic: { type: 'breaking', name: 'international-sport' },
	},
	'breaking-news-europe-sport': {
		label: 'Breaking news Europe sport',
		mobileN10nTopic: { type: 'breaking', name: 'europe-sport' },
	},
	'breaking-news-uk-editors-picks': {
		label: "Breaking news UK editors' picks",
		mobileN10nTopic: { type: 'breaking', name: 'uk-editors-picks' },
	},
	'breaking-news-us-editors-picks': {
		label: "Breaking news US editors' picks",
		mobileN10nTopic: { type: 'breaking', name: 'us-editors-picks' },
	},
	'breaking-news-au-editors-picks': {
		label: "Breaking news AU editors' picks",
		mobileN10nTopic: { type: 'breaking', name: 'au-editors-picks' },
	},
	'breaking-news-international-editors-picks': {
		label: "Breaking news International editors' picks",
		mobileN10nTopic: { type: 'breaking', name: 'international-editors-picks' },
	},
	'breaking-news-europe-editors-picks': {
		label: "Breaking news Europe editors' picks",
		mobileN10nTopic: { type: 'breaking', name: 'europe-editors-picks' },
	},
	'breaking-news-uk-one-not-to-miss': {
		label: 'Breaking news UK one not to miss',
		mobileN10nTopic: { type: 'breaking', name: 'uk-one-not-to-miss' },
	},
	'breaking-news-us-one-not-to-miss': {
		label: 'Breaking news US one not to miss',
		mobileN10nTopic: { type: 'breaking', name: 'us-one-not-to-miss' },
	},
	'breaking-news-au-one-not-to-miss': {
		label: 'Breaking news AU one not to miss',
		mobileN10nTopic: { type: 'breaking', name: 'au-one-not-to-miss' },
	},
	'breaking-news-international-one-not-to-miss': {
		label: 'Breaking news International one not to miss',
		mobileN10nTopic: {
			type: 'breaking',
			name: 'international-one-not-to-miss',
		},
	},
	'breaking-news-europe-one-not-to-miss': {
		label: 'Breaking news Europe one not to miss',
		mobileN10nTopic: { type: 'breaking', name: 'europe-one-not-to-miss' },
	},
	'uk-general-election': {
		label: 'UK general election',
		mobileN10nTopic: { type: 'breaking', name: 'uk-general-election' },
	},
	'newsstand-ios': {
		label: 'Newsstand iOS',
		mobileN10nTopic: { type: 'newsstand', name: 'newsstandIos' },
	},
	test: {
		label: 'Test',
		mobileN10nTopic: { type: 'breaking', name: 'internal-test' },
	},
} as const satisfies Record<string, AppPushNotificationSegment>;

export type AppPushNotificationSegmentId =
	keyof typeof appPushNotificationSegments;

// Non-empty tuples so the validator can build `z.enum(...)` from them.
export const newsletterSegmentIds = Object.keys(newsletterSegments) as [
	NewsletterSegmentId,
	...NewsletterSegmentId[],
];

export const appPushNotificationSegmentIds = Object.keys(
	appPushNotificationSegments,
) as [AppPushNotificationSegmentId, ...AppPushNotificationSegmentId[]];

/**
 * mobile-n10n's `POST /push/topic` rejects a push targeting more than 20 topics
 * (`Main.pushTopics`: `val MaxTopics = 20` → `400 "Too many topics, maximum:
 * 20"`). Each push segment resolves to one mobile-n10n topic, so this caps the
 * segments a single push plan may target.
 */
export const MAX_APP_PUSH_SEGMENTS = 20;

/**
 * Newsletter segments resolve to Braze campaigns. Capped independently of push
 * (mobile-n10n) so a change to either downstream contract can't silently move
 * the other, even though both currently sit at 20.
 */
export const MAX_NEWSLETTER_SEGMENTS = 20;

export const MAX_TEST_EMAIL_RECIPIENTS = 20;
