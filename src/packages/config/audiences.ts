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
			// this is the right id for the CODE version of this newsletter - the PROD version below does have different casing
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
			brazeCampaignId: '93b0c12d-8c7e-43be-b3b5-88a149ba511f',
			emailRenderingNewsletterId: 'breaking-news-us',
		},
		AU: {
			label: 'AU',
			brazeCampaignId: '149aa55d-570a-40a5-82d4-8f44a713ad58',
			emailRenderingNewsletterId: 'breaking-news-australia',
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
export const AppPushImportance = {
	Major: 'Major',
	Minor: 'Minor',
} as const;
export type AppPushImportance =
	(typeof AppPushImportance)[keyof typeof AppPushImportance];

interface AppPushEdition {
	label: string;
	mobileN10nTopic: MobileN10nTopic;
	/**
	 * Overrides the notification title for this specific edition. When set, the
	 * edition is dispatched as its own push rather than grouped with the rest of
	 * its topic type, so it can carry this bespoke title.
	 */
	titleOverride?: string;
}

interface AppPushTopicType {
	label: string;
	importance: AppPushImportance;
	editions: Record<string, AppPushEdition>;
}

/**
 * Push targets are curated topic types, each exposing its `editions`. A request
 * names a topic type and one of its editions; the backend resolves that pair to
 * the mobile-n10n topic (`{ type, name }`) that `guardian/facia-tool`'s Breaking
 * News tool emits. The raw topic coordinates are kept out of the public
 * contract. The internal test topic lives in `internalAppPushTestTopicTypes`,
 * not here, so it can never be targeted by a production send.
 *
 * Duplicated per stage (`codeAppPushTopicTypes` / `prodAppPushTopicTypes`) so
 * CODE and PROD can be configured independently.
 */
const codeAppPushTopicTypes = {
	'breaking-news': {
		label: 'Breaking news',
		importance: AppPushImportance.Major,
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
			},
			us: {
				label: 'US',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
			},
			au: {
				label: 'AU',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
			},
			international: {
				label: 'International',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
			},
		},
	},
	sport: {
		label: 'Sport news',
		importance: AppPushImportance.Minor,
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
			},
			us: {
				label: 'US',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
				titleOverride: 'Sports news',
			},
			au: {
				label: 'AU',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
			},
			international: {
				label: 'International',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
		},
	},
	'editors-picks': {
		label: "Editors' picks",
		importance: AppPushImportance.Minor,
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			us: {
				label: 'US',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			au: {
				label: 'AU',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			international: {
				label: 'International',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
		},
	},
	'one-not-to-miss': {
		label: 'One not to miss',
		importance: AppPushImportance.Minor,
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			us: {
				label: 'US',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			au: {
				label: 'AU',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			international: {
				label: 'International',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'internal-dispatch-test',
				},
			},
		},
	},
} as const satisfies Record<string, AppPushTopicType>;

/**
 * PROD duplicate of {@link codeAppPushTopicTypes}. Currently identical, but kept
 * separate so PROD topic coordinates can diverge without affecting CODE.
 */
const prodAppPushTopicTypes = {
	// 'breaking-news': {
	// 	label: 'Breaking news',
	// 	importance: AppPushImportance.Major,
	// 	editions: {
	// 		uk: { label: 'UK', mobileN10nTopic: { type: 'breaking', name: 'uk' } },
	// 		us: { label: 'US', mobileN10nTopic: { type: 'breaking', name: 'us' } },
	// 		au: { label: 'AU', mobileN10nTopic: { type: 'breaking', name: 'au' } },
	// 		international: {
	// 			label: 'International',
	// 			mobileN10nTopic: { type: 'breaking', name: 'international' },
	// 		},
	// 		europe: {
	// 			label: 'Europe',
	// 			mobileN10nTopic: { type: 'breaking', name: 'europe' },
	// 		},
	// 	},
	// },
	// sport: {
	// 	label: 'Sport news',
	// 	importance: AppPushImportance.Minor,
	// 	editions: {
	// 		uk: {
	// 			label: 'UK',
	// 			mobileN10nTopic: { type: 'breaking', name: 'uk-sport' },
	// 		},
	// 		us: {
	// 			label: 'US',
	// 			mobileN10nTopic: { type: 'breaking', name: 'us-sport' },
	// 			titleOverride: 'Sports news',
	// 		},
	// 		au: {
	// 			label: 'AU',
	// 			mobileN10nTopic: { type: 'breaking', name: 'au-sport' },
	// 		},
	// 		international: {
	// 			label: 'International',
	// 			mobileN10nTopic: { type: 'breaking', name: 'international-sport' },
	// 		},
	// 		europe: {
	// 			label: 'Europe',
	// 			mobileN10nTopic: { type: 'breaking', name: 'europe-sport' },
	// 		},
	// 	},
	// },
	'editors-picks': {
		label: "Editors' picks",
		importance: AppPushImportance.Minor,
		editions: {
			uk: {
				label: 'UK',
				mobileN10nTopic: { type: 'breaking', name: 'uk-editors-picks' },
			},
			us: {
				label: 'US',
				mobileN10nTopic: { type: 'breaking', name: 'us-editors-picks' },
			},
			au: {
				label: 'AU',
				mobileN10nTopic: { type: 'breaking', name: 'au-editors-picks' },
			},
			international: {
				label: 'International',
				mobileN10nTopic: {
					type: 'breaking',
					name: 'international-editors-picks',
				},
			},
			europe: {
				label: 'Europe',
				mobileN10nTopic: { type: 'breaking', name: 'europe-editors-picks' },
			},
		},
	},
	// 'one-not-to-miss': {
	// 	label: 'One not to miss',
	// 	importance: AppPushImportance.Minor,
	// 	editions: {
	// 		uk: {
	// 			label: 'UK',
	// 			mobileN10nTopic: { type: 'breaking', name: 'uk-one-not-to-miss' },
	// 		},
	// 		us: {
	// 			label: 'US',
	// 			mobileN10nTopic: { type: 'breaking', name: 'us-one-not-to-miss' },
	// 		},
	// 		au: {
	// 			label: 'AU',
	// 			mobileN10nTopic: { type: 'breaking', name: 'au-one-not-to-miss' },
	// 		},
	// 		international: {
	// 			label: 'International',
	// 			mobileN10nTopic: {
	// 				type: 'breaking',
	// 				name: 'international-one-not-to-miss',
	// 			},
	// 		},
	// 		europe: {
	// 			label: 'Europe',
	// 			mobileN10nTopic: { type: 'breaking', name: 'europe-one-not-to-miss' },
	// 		},
	// 	},
	// },
} as const satisfies Record<string, AppPushTopicType>;

/**
 * The internal test topic type. Its single edition resolves to mobile-n10n's
 * `internal-test` topic, which only internal test devices subscribe to. Kept out
 * of the curated topic types so it is accepted solely by
 * `POST /v1/notification-tests`, never the production notifications endpoint.
 */
const internalAppPushTestTopicTypes = {
	test: {
		label: 'Test',
		importance: AppPushImportance.Minor,
		editions: {
			test: {
				label: 'Test',
				mobileN10nTopic: { type: 'breaking', name: 'internal-dispatch-test' },
			},
		},
	},
} as const satisfies Record<string, AppPushTopicType>;

/**
 * Separated per stage to mirror newsletter segments. CODE and PROD hold
 * duplicate curated sets so either stage can be configured independently
 * without disturbing the other.
 */
const appPushTopicTypesByStage = {
	CODE: codeAppPushTopicTypes,
	PROD: prodAppPushTopicTypes,
} as const satisfies Record<'CODE' | 'PROD', Record<string, AppPushTopicType>>;

export type AppPushTopicTypeId = keyof typeof appPushTopicTypesByStage.CODE;

// Keyed by string, not the full `AppPushTopicTypeId` union: a stage may expose a
// subset of the curated topic types (e.g. PROD while others are still rolling out).
export const getAppPushTopicTypes = (
	stage: Env['STAGE'],
): Record<string, AppPushTopicType> =>
	appPushTopicTypesByStage[stage === 'PROD' ? 'PROD' : 'CODE'];

export const appPushTopicTypes = getAppPushTopicTypes(configurationStage);

/**
 * The internal test topic types. Not stage-dependent (the `internal-test` topic
 * exists in every environment) and only ever offered by the test endpoint.
 */
export type AppPushTestTopicTypeId = keyof typeof internalAppPushTestTopicTypes;

export const appPushTestTopicTypes = internalAppPushTestTopicTypes;

/** Production and internal-test topic types share a resolver. */
const resolvableAppPushTopicTypes: Record<string, AppPushTopicType> = {
	...appPushTopicTypes,
	...appPushTestTopicTypes,
};

/** Resolves a (topic type, edition) pair to its downstream topic and importance. */
export const resolveAppPushTopic = (
	topicTypeId: AppPushTopicTypeId | AppPushTestTopicTypeId,
	editionId: string,
):
	| {
			topic: MobileN10nTopic;
			importance: AppPushImportance;
			titleOverride?: string;
	  }
	| undefined => {
	const topicType = resolvableAppPushTopicTypes[topicTypeId];
	const edition = topicType?.editions[editionId];
	if (!edition) {
		return undefined;
	}
	return {
		topic: edition.mobileN10nTopic,
		importance: topicType.importance,
		titleOverride: edition.titleOverride,
	};
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

export const appPushTestTopicTypeIds = Object.keys(appPushTestTopicTypes) as [
	AppPushTestTopicTypeId,
	...AppPushTestTopicTypeId[],
];

/** Internal-test edition ids per test topic type, as non-empty tuples. */
export const appPushTestEditionIdsByTopicType = Object.fromEntries(
	Object.entries(appPushTestTopicTypes).map(([topicTypeId, { editions }]) => [
		topicTypeId,
		Object.keys(editions),
	]),
) as Record<AppPushTestTopicTypeId, [string, ...string[]]>;

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
