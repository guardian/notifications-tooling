import { describe, expect, it } from 'bun:test';
import {
	AppPushImportance,
	appPushTestEditionIdsByTopicType,
	appPushTestTopicTypeIds,
	appPushTopicTypeIds,
	getNewsletterSegments,
	resolveAppPushTopic,
} from './audiences';

describe('getNewsletterSegments', () => {
	it('uses CODE values for DEV and CODE', () => {
		expect(getNewsletterSegments('DEV')).toEqual(getNewsletterSegments('CODE'));
		expect(getNewsletterSegments('CODE').UK.brazeCampaignId).toBe(
			'da019800-869e-4e1d-9c2e-029741829af1',
		);
	});
});

describe('resolveAppPushTopic', () => {
	it('resolves the internal test topic to its mobile-n10n coordinates', () => {
		expect(resolveAppPushTopic('test', 'test')).toEqual({
			topic: { type: 'breaking', name: 'internal-dispatch-test' },
			importance: AppPushImportance.Minor,
		});
	});

	it('resolves a production topic edition', () => {
		expect(resolveAppPushTopic('breaking-news', 'UK')).toEqual({
			topic: { type: 'breaking', name: 'UK' },
			importance: AppPushImportance.Major,
			titleOverride: undefined,
		});
	});

	it('surfaces the title override for the US sport edition', () => {
		expect(resolveAppPushTopic('sport', 'US')).toEqual({
			topic: { type: 'breaking', name: 'us-sport' },
			importance: AppPushImportance.Minor,
			titleOverride: 'Sports news',
		});
	});

	it('leaves other sport editions without a title override', () => {
		expect(resolveAppPushTopic('sport', 'UK')).toEqual({
			topic: { type: 'breaking', name: 'uk-sport' },
			importance: AppPushImportance.Minor,
			titleOverride: undefined,
		});
	});

	it('returns undefined for an edition the topic type does not define', () => {
		expect(resolveAppPushTopic('test', 'UK')).toBeUndefined();
	});
});

describe('app-push test topic isolation', () => {
	it('exposes only the internal test topic to the test endpoint', () => {
		expect(appPushTestTopicTypeIds).toEqual(['test']);
		expect(appPushTestEditionIdsByTopicType).toEqual({ test: ['test'] });
	});

	it('keeps the internal test topic out of the production topic set', () => {
		expect(appPushTopicTypeIds).not.toContain('test');
	});
});
