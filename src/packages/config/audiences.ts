/**
 * Defines public, channel-agnostic segment ids served, in future, by
 * `GET /v1/audiences`. The backend resolves newsletter segments to
 * email-rendering newsletter configurations and Braze campaigns, and push
 * segments to mobile-n10n topics. These internals are kept out of the public
 * `POST /v1/notifications` contract, which references segment ids only.
 * Hard-coded stub until resolved from the downstream services.
 */

import { configurationStage, type Env } from './env';

export interface NewsletterSegment {
	label: string;
	brazeCampaignId: string;
	emailRenderingNewsletterId: string;
}

// TODO: Move this configuration into settings backed by JSON in S3 or RDS.
const newsletterSegmentsByStage = {
	CODE: {
		UK: {
			label: 'UK',
			brazeCampaignId: 'da019800-869e-4e1d-9c2e-029741829af1',
			emailRenderingNewsletterId: 'breaking-news-uk',
		},
		US: {
			label: 'US',
			brazeCampaignId: 'a945e3ae-165b-46d7-b163-0ca1c6beb2f4',
			emailRenderingNewsletterId: 'breakingnewsus',
		},
		AU: {
			label: 'AU',
			brazeCampaignId: '5da1b754-42f4-440d-9eec-0d595190a0f0',
			emailRenderingNewsletterId: 'breaking-news-au',
		},
	},
	PROD: {
		UK: {
			label: 'UK',
			brazeCampaignId: '',
			emailRenderingNewsletterId: '',
		},
		US: {
			label: 'US',
			brazeCampaignId: '',
			emailRenderingNewsletterId: '',
		},
		AU: {
			label: 'AU',
			brazeCampaignId: '',
			emailRenderingNewsletterId: '',
		},
	},
} as const satisfies Record<'CODE' | 'PROD', Record<string, NewsletterSegment>>;

type NewsletterSegmentId = keyof typeof newsletterSegmentsByStage.CODE;

export const getNewsletterSegments = (
	stage: Env['STAGE'],
): Record<NewsletterSegmentId, NewsletterSegment> =>
	newsletterSegmentsByStage[stage === 'PROD' ? 'PROD' : 'CODE'];

export const newsletterSegments = getNewsletterSegments(configurationStage);

interface MobileN10nTopic {
	type: string;
	name: string;
}

/**
 * mobile-n10n's `importance` values (`BreakingNewsPayload.importance`). Used
 * only by the app-push dispatch; never exposed in the public audiences contract.
 */
export enum AppPushImportance {
	Major = 'Major',
	Minor = 'Minor',
}

interface AppPushEdition {
	label: string;
	mobileN10nTopic: MobileN10nTopic;
	importance: AppPushImportance;
}

interface AppPushTopicType {
	label: string;
	editions: Record<string, AppPushEdition>;
}

/**
 * Push targets are curated topic types, each exposing its `editions`. A request
 * names a topic type and one of its editions; the backend resolves that pair to
 * the mobile-n10n topic (`{ type, name }`) that `guardian/facia-tool`'s Breaking
 * News tool emits, plus the registered `newsstand` topic. `test` is a catch-all
 * used while push is wired up end to end. The raw topic coordinates are kept out
 * of the public contract.
 */
const curatedAppPushTopicTypes = {
	'breaking-news': {
		label: 'Breaking news',
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'uk' },
				importance: AppPushImportance.Major,
			},
			us: {
				label: 'US',
				mobileN10nTopic: { type: 'breaking', name: 'us' },
				importance: AppPushImportance.Major,
			},
			au: {
				label: 'AU',
				mobileN10nTopic: { type: 'breaking', name: 'au' },
				importance: AppPushImportance.Major,
			},
			international: {
				label: 'International',
				mobileN10nTopic: { type: 'breaking', name: 'international' },
				importance: AppPushImportance.Major,
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: { type: 'breaking', name: 'europe' },
				importance: AppPushImportance.Major,
			},
		},
	},
	sport: {
		label: 'Sport',
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'uk-sport' },
				importance: AppPushImportance.Minor,
			},
			us: {
				label: 'US',
				mobileN10nTopic: { type: 'breaking', name: 'us-sport' },
				importance: AppPushImportance.Minor,
			},
			au: {
				label: 'AU',
				mobileN10nTopic: { type: 'breaking', name: 'au-sport' },
				importance: AppPushImportance.Minor,
			},
			international: {
				label: 'International',
				mobileN10nTopic: { type: 'breaking', name: 'international-sport' },
				importance: AppPushImportance.Minor,
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: { type: 'breaking', name: 'europe-sport' },
				importance: AppPushImportance.Minor,
			},
		},
	},
	'editors-picks': {
		label: "Editors' picks",
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'uk-editors-picks' },
				importance: AppPushImportance.Minor,
			},
			us: {
				label: 'US',
				mobileN10nTopic: { type: 'breaking', name: 'us-editors-picks' },
				importance: AppPushImportance.Minor,
			},
			au: {
				label: 'AU',
				mobileN10nTopic: { type: 'breaking', name: 'au-editors-picks' },
				importance: AppPushImportance.Minor,
			},
			international: {
				label: 'International',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'international-editors-picks',
				},
				importance: AppPushImportance.Minor,
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: { type: 'breaking', name: 'europe-editors-picks' },
				importance: AppPushImportance.Minor,
			},
		},
	},
	'one-not-to-miss': {
		label: 'One not to miss',
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'uk-one-not-to-miss' },
				importance: AppPushImportance.Minor,
			},
			us: {
				label: 'US',
				mobileN10nTopic: { type: 'breaking', name: 'us-one-not-to-miss' },
				importance: AppPushImportance.Minor,
			},
			au: {
				label: 'AU',
				mobileN10nTopic: { type: 'breaking', name: 'au-one-not-to-miss' },
				importance: AppPushImportance.Minor,
			},
			international: {
				label: 'International',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'international-one-not-to-miss',
				},
				importance: AppPushImportance.Minor,
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: { type: 'breaking', name: 'europe-one-not-to-miss' },
				importance: AppPushImportance.Minor,
			},
		},
	},
	'uk-general-election': {
		label: 'UK general election',
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'uk-general-election' },
				importance: AppPushImportance.Minor,
			},
		},
	},
	newsstand: {
		label: 'Newsstand',
		editions: {
			ios: {
				label: 'iOS',
				mobileN10nTopic: { type: 'newsstand', name: 'newsstandIos' },
				importance: AppPushImportance.Minor,
			},
		},
	},
	test: {
		label: 'Test',
		editions: {
			test: {
				label: 'Test',
				mobileN10nTopic: { type: 'breaking', name: 'internal-test' },
				importance: AppPushImportance.Minor,
			},
		},
	},
} as const satisfies Record<string, AppPushTopicType>;

/**
 * Separated per stage to mirror newsletter segments. mobile-n10n topic
 * coordinates are the same across environments (unlike Braze campaign ids), so
 * CODE and PROD currently share the same curated set; the split lets either
 * stage diverge without disturbing the other.
 */
const appPushTopicTypesByStage = {
	CODE: curatedAppPushTopicTypes,
	PROD: curatedAppPushTopicTypes,
} as const satisfies Record<'CODE' | 'PROD', Record<string, AppPushTopicType>>;

export type AppPushTopicTypeId = keyof typeof appPushTopicTypesByStage.CODE;

export const getAppPushTopicTypes = (
	stage: Env['STAGE'],
): Record<AppPushTopicTypeId, AppPushTopicType> =>
	appPushTopicTypesByStage[stage === 'PROD' ? 'PROD' : 'CODE'];

export const appPushTopicTypes = getAppPushTopicTypes(configurationStage);

/** Resolves a request's (topic type, edition) pair to its mobile-n10n topic. */
export const resolveAppPushTopic = (
	topicTypeId: AppPushTopicTypeId,
	editionId: string,
): MobileN10nTopic | undefined => {
	const editions: Record<string, AppPushEdition> =
		appPushTopicTypes[topicTypeId].editions;
	return editions[editionId]?.mobileN10nTopic;
};

// Non-empty tuples so the validator can build `z.enum(...)` from them.
export const newsletterSegmentIds = Object.keys(newsletterSegments) as [
	NewsletterSegmentId,
	...NewsletterSegmentId[],
];

export const appPushTopicTypeIds = Object.keys(appPushTopicTypes) as [
	AppPushTopicTypeId,
	...AppPushTopicTypeId[],
];

/** Edition ids per topic type, as non-empty tuples for `z.enum(...)`. */
export const appPushEditionIdsByTopicType = Object.fromEntries(
	Object.entries(appPushTopicTypes).map(([topicTypeId, { editions }]) => [
		topicTypeId,
		Object.keys(editions),
	]),
) as Record<AppPushTopicTypeId, [string, ...string[]]>;

/**
 * mobile-n10n's `POST /push/topic` rejects a push targeting more than 20 topics
 * (`Main.pushTopics`: `val MaxTopics = 20` → `400 "Too many topics, maximum:
 * 20"`). Each push audience item resolves to one mobile-n10n topic, so this
 * caps the topics a single push plan may target.
 */
export const MAX_APP_PUSH_TOPICS = 20;

/**
 * Newsletter segments resolve to Braze campaigns. Capped independently of push
 * (mobile-n10n) so a change to either downstream contract can't silently move
 * the other, even though both currently sit at 20.
 */
export const MAX_NEWSLETTER_SEGMENTS = 20;

export const MAX_TEST_EMAIL_RECIPIENTS = 20;
