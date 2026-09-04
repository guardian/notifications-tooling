import type { ResolvedArticle } from '@models';

export const articleFixture: ResolvedArticle = {
	id: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
	type: 'article',
	sectionId: 'environment',
	sectionName: 'Environment',
	webPublicationDate: '2026-07-19T15:37:18Z',
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
		thumbnail:
			'https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg',
	},
	isHosted: false,
	pillarId: 'pillar/news',
	pillarName: 'News',
	tags: [],
	references: [],
};

export const liveblogFixture: ResolvedArticle = {
	...articleFixture,
	id: 'world/live/2026/sep/04/latest-developments',
	type: 'liveblog',
	webTitle: 'Latest developments',
	webUrl:
		'https://www.theguardian.com/world/live/2026/sep/04/latest-developments',
	fields: {
		headline: 'Latest developments',
		lastModified: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		thumbnail: 'https://media.guim.co.uk/liveblog/latest-image/500.jpg',
	},
	blocks: {
		main: {
			id: 'liveblog-main-block-id',
			elements: [
				{
					type: 'image',
					assets: [
						{
							file: 'https://media.guim.co.uk/liveblog/latest-update/500.jpg',
							typeData: { width: 500 },
						},
					],
					imageTypeData: { alt: 'Latest liveblog update' },
				},
			],
		},
	},
};
