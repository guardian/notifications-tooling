import type { CapiDateTime } from '@guardian/content-api-models/v1/capiDateTime';
import type { Content } from '@guardian/content-api-models/v1/content';
import { ContentType } from '@guardian/content-api-models/v1/contentType';

export const articleFixture: Content = {
	id: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
	type: ContentType.ARTICLE,
	sectionId: 'environment',
	sectionName: 'Environment',
	webPublicationDate: {
		dateTime: {} as CapiDateTime['dateTime'],
		iso8601: '2026-07-19T15:37:18Z',
	},
	webTitle: 'A rhyme to recall rising temperatures | Brief letters',
	webUrl:
		'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
	apiUrl:
		'https://content.guardianapis.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
	fields: {
		headline: 'A rhyme to recall rising temperatures',
		standfirst:
			'\u003Cp\u003EThe new normal | Cool school | Italian idiom | Word Wheel | Covid failings\u003C/p\u003E',
		trailText:
			'\u003Cstrong\u003EBrief letters: \u003C/strong\u003EThe new normal | Cool school | Italian idiom | Word Wheel | Covid failings',
	},
	isHosted: false,
	pillarId: 'pillar/news',
	pillarName: 'News',
	tags: [],
	references: [],
};
