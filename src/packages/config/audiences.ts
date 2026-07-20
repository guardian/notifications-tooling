/**
 * Stub channel audience allow-lists.
 *
 * In production these would be resolved from the downstream services (Braze
 * campaigns for newsletters, mobile-n10n topics for push) and exposed via
 * `GET /v1/channels/audiences`. For now they are hard-coded so the validator
 * can reject references to unknown campaigns/topics.
 */

/** Newsletter audiences are addressed by Braze campaign. */
export const newsletterCampaigns = [
	'morning-briefing',
	'first-edition',
	'editorial-breaking-news',
] as const;

export type NewsletterCampaign = (typeof newsletterCampaigns)[number];

/** The topic `type`s mobile-n10n recognises. */
export const pushTopicTypes = ['breaking', 'content', 'newsstand'] as const;

export type PushTopicType = (typeof pushTopicTypes)[number];

/** The concrete push topics a notification may currently target. */
export const pushTopics = [
	{ type: 'breaking', name: 'uk' },
	{ type: 'breaking', name: 'us' },
	{ type: 'breaking', name: 'international' },
	{ type: 'content', name: 'world' },
	{ type: 'content', name: 'politics' },
] as const satisfies ReadonlyArray<{ type: PushTopicType; name: string }>;

/** mobile-n10n rejects a push targeting more than 20 topics. */
export const MAX_PUSH_TOPICS = 20;
