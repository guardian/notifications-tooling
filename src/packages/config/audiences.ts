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

/**
 * The topic `type`s mobile-n10n recognises.
 *
 * Mirrors `TopicTypes` in mobile-n10n's `api-models`
 * (`com.gu.mobile.notifications.client.models.TopicTypes`). A topic is
 * serialised downstream as `type//name` (e.g. `breaking//uk`).
 */
export const pushTopicTypes = [
	'breaking',
	'content',
	'tag-contributor',
	'tag-keyword',
	'tag-series',
	'tag-blog',
	'football-team',
	'football-team-live-activity',
	'football-match',
	'football-match-live-activity',
	'user-type',
	'newsstand',
] as const;

export type PushTopicType = (typeof pushTopicTypes)[number];

/**
 * The concrete push topics a notification may currently target.
 *
 * These mirror the topics the Breaking News tool in `guardian/facia-tool` (the
 * v1 fronts tool) actually emits — every one is a `breaking`-type topic. The
 * names come from `BreakingNewsUpdate.scala` (editions + the sport, editors'
 * picks and one-not-to-miss variants) and the named `Topic` values in
 * mobile-n10n's `Topic.scala`. `newsstandIos` is a registered `newsstand`
 * topic in the model (not sent by facia-tool) and is included for completeness.
 */
export const pushTopics = [
	// Breaking news editions (`global` fans out to all five).
	{ type: 'breaking', name: 'uk' },
	{ type: 'breaking', name: 'us' },
	{ type: 'breaking', name: 'au' },
	{ type: 'breaking', name: 'international' },
	{ type: 'breaking', name: 'europe' },
	// Sport (`global-sport` fans out to all five).
	{ type: 'breaking', name: 'uk-sport' },
	{ type: 'breaking', name: 'us-sport' },
	{ type: 'breaking', name: 'au-sport' },
	{ type: 'breaking', name: 'international-sport' },
	{ type: 'breaking', name: 'europe-sport' },
	// Editors' picks (`global-editors-picks` fans out to all five).
	{ type: 'breaking', name: 'uk-editors-picks' },
	{ type: 'breaking', name: 'us-editors-picks' },
	{ type: 'breaking', name: 'au-editors-picks' },
	{ type: 'breaking', name: 'international-editors-picks' },
	{ type: 'breaking', name: 'europe-editors-picks' },
	// One not to miss (`global-one-not-to-miss` fans out to all five).
	{ type: 'breaking', name: 'uk-one-not-to-miss' },
	{ type: 'breaking', name: 'us-one-not-to-miss' },
	{ type: 'breaking', name: 'au-one-not-to-miss' },
	{ type: 'breaking', name: 'international-one-not-to-miss' },
	{ type: 'breaking', name: 'europe-one-not-to-miss' },
	// Standalone breaking topics.
	{ type: 'breaking', name: 'uk-general-election' },
	{ type: 'breaking', name: 'internal-test' },
	// Newsstand (registered in the model, not emitted by facia-tool).
	{ type: 'newsstand', name: 'newsstandIos' },
] as const satisfies ReadonlyArray<{ type: PushTopicType; name: string }>;

/** mobile-n10n rejects a push targeting more than 20 topics. */
export const MAX_PUSH_TOPICS = 20;
