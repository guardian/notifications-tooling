import { describe, expect, it } from 'bun:test';
import {
	AppPushImportance,
	appPushTestEditionIdsByTopicType,
	appPushTestTopicTypeIds,
	appPushTopicTypeIds,
	getAppPushTopicTypes,
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
	it('exposes the notification bucket labels', () => {
		expect(
			Object.fromEntries(
				Object.entries(getAppPushTopicTypes('CODE')).map(([id, { label }]) => [
					id,
					label,
				]),
			),
		).toEqual({
			'breaking-news': 'Breaking news',
			sport: 'Sports news',
			'editors-picks': "Editors' picks",
			'one-not-to-miss': 'One not to miss',
		});
	});

	it('resolves the internal test topic to its mobile-n10n coordinates', () => {
		expect(resolveAppPushTopic('test', 'test')).toEqual({
			topic: { type: 'breaking', name: 'internal-dispatch-test' },
			importance: AppPushImportance.Minor,
		});
	});

	it('resolves a production topic edition', () => {
		expect(resolveAppPushTopic('breaking-news', 'uk')).toEqual({
			topic: { type: 'breaking', name: 'internal-dispatch-test' },
			importance: AppPushImportance.Major,
			titleOverride: undefined,
		});
	});

	it('resolves the regional sport titles for every edition', () => {
		for (const edition of ['uk', 'au', 'international', 'europe']) {
			expect(resolveAppPushTopic('sport', edition)?.titleOverride).toBe(
				'Sport news',
			);
		}
		expect(resolveAppPushTopic('sport', 'us')?.titleOverride).toBe(
			'Sports news',
		);
	});

	it('returns undefined for an edition the topic type does not define', () => {
		expect(resolveAppPushTopic('test', 'uk')).toBeUndefined();
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
