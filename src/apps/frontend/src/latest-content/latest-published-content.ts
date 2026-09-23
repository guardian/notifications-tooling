import type { LatestArticle } from '@models';

export interface LatestPublishedContentItem {
	id: string;
	headline: string;
	url: string;
	imageUrl?: string;
	section: string;
	pillarName?: string;
	pillarId?: string;
	publishedAt: string;
	tags: Array<{ path?: string }>;
}

/** Maps a backend `LatestArticle` onto the shape the panel/card render. */
export const mapLatestArticleToContentItem = (
	article: LatestArticle,
): LatestPublishedContentItem => ({
	id: article.id,
	headline: article.headline,
	url: article.webUrl,
	imageUrl: article.thumbnail,
	section: article.section,
	pillarName: article.pillarName,
	pillarId: article.pillarId,
	publishedAt: article.publishedAt,
	tags: article.intendedAudience.map((region) => ({
		path: `tracking/audience/${region}`,
	})),
});

// Every headline links here until a real "latest published content" API exists.
const ARTICLE_URL =
	'https://www.theguardian.com/commentisfree/2026/sep/16/quit-veg-box-scheme-set-my-mind-free';

export const mockLatestPublishedContent: LatestPublishedContentItem[] = [
	{
		id: 'mock-1',
		headline:
			"Spain win World Cup after Ferran Torres breaks 10-man Argentina's resistance",
		url: ARTICLE_URL,
		imageUrl:
			'https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg',
		section: 'Football',
		pillarName: 'News',
		pillarId: 'pillar/sport',
		publishedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		tags: [
			{ path: 'tracking/audience/uk' },
			{ path: 'tracking/audience/global' },
		],
	},
	{
		id: 'mock-2',
		headline: 'Luigi Mangione due to appear in New York court',
		url: ARTICLE_URL,
		imageUrl:
			'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
		section: 'US News',
		pillarName: 'News',
		pillarId: 'pillar/news',
		publishedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		tags: [{ path: 'tracking/audience/us' }],
	},
	{
		id: 'mock-3',
		headline:
			'Progressives and establishment-backed Democrats set to clash in Wisconsin...',
		url: ARTICLE_URL,
		imageUrl:
			'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
		section: 'Live',
		pillarName: 'Live',
		pillarId: 'pillar/news',
		publishedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		tags: [
			{ path: 'tracking/audience/uk' },
			{ path: 'tracking/audience/global' },
		],
	},
	{
		id: 'mock-4',
		headline:
			'Scores dead in Colombia after powerful earthquake strikes west of country',
		url: ARTICLE_URL,
		imageUrl:
			'https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg',
		section: 'World News',
		pillarName: 'News',
		pillarId: 'pillar/news',
		publishedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		tags: [
			{ path: 'tracking/audience/uk' },
			{ path: 'tracking/audience/global' },
		],
	},
	{
		id: 'mock-5',
		headline:
			'Scores dead in Colombia after powerful earthquake strikes west of country',
		url: ARTICLE_URL,
		imageUrl:
			'https://media.guim.co.uk/a3c03b15c4f2b06bd40cfe450f898cb7c659d737/2133_482_3367_2694/500.jpg',
		section: 'World News',
		pillarName: 'News',
		pillarId: 'pillar/news',
		publishedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		tags: [
			{ path: 'tracking/audience/uk' },
			{ path: 'tracking/audience/global' },
		],
	},
	{
		id: 'mock-6',
		headline:
			'Scores dead in Colombia after powerful earthquake strikes west of country',
		url: ARTICLE_URL,
		imageUrl:
			'https://media.guim.co.uk/5f2a9721082c580c1696cd5bb8e2ca0d711bf608/361_0_1440_1152/500.jpg',
		section: 'World News',
		pillarName: 'News',
		// Deliberately unrecognised pillar id, to exercise the default colour fallback.
		pillarId: 'pillar/unknown',
		publishedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
		tags: [
			{ path: 'tracking/audience/us' },
			{ path: 'tracking/audience/global' },
		],
	},
];
