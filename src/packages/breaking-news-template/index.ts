import templateHtmlBundle from './breaking-news-us-template.html' with { type: 'text' };

const templateHtml = templateHtmlBundle as unknown as string;

export type BreakingNewsTemplateArticle = {
	body: string;
	headline: string;
	imageUrl: string;
	subject: string;
	url: string;
};

type RenderBreakingNewsTemplateOptions = {
	includePreviewMarkers?: boolean;
	now?: Date;
};

export const DEFAULT_BREAKING_NEWS_IMAGE =
	'https://i.guim.co.uk/img/uploads/2024/08/14/BreakingNewsAustralia_Red_2_email-header.png?quality=85&dpr=2&width=1200&s=7569b6852eb30cf21d85609477981335';

const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

const formatBreakingNewsDate = (date: Date = new Date()) =>
	new Intl.DateTimeFormat('en-US', {
		day: 'numeric',
		month: 'short',
		timeZone: 'UTC',
		weekday: 'short',
		year: 'numeric',
	}).format(date);

const markerAttribute = (name: string, includePreviewMarkers: boolean) =>
	includePreviewMarkers ? ` data-preview="${name}" ` : '';

type TemplateToken =
	| 'article_url'
	| 'body'
	| 'body_preview_marker'
	| 'email_date'
	| 'email_subject'
	| 'headline'
	| 'headline_link_preview_marker'
	| 'headline_preview_marker'
	| 'image_link_preview_marker'
	| 'image_preview_marker'
	| 'image_url';

const replaceTemplateTokens = (
	values: Partial<Record<TemplateToken, string>>,
) => {
	const rendered = templateHtml.replace(
		/{{([a-z_]+)}}/g,
		(token, name: string) => {
			const value = values[name as TemplateToken];

			if (value === undefined) {
				throw new Error(`No value was provided for template token ${token}.`);
			}

			return value;
		},
	);

	if (/{{[a-z_]+}}/.test(rendered)) {
		throw new Error('The breaking news template has unresolved tokens.');
	}

	return rendered;
};

export const withBrazeUtm = (url: string) => {
	if (!url) {
		return '';
	}

	return url.includes('?') ? `${url}&##braze_utm##` : `${url}?##braze_utm##`;
};

export const renderBreakingNewsTemplate = (
	article: BreakingNewsTemplateArticle,
	options: RenderBreakingNewsTemplateOptions = {},
) => {
	const { includePreviewMarkers = false, now } = options;
	const articleUrlWithBraze = withBrazeUtm(article.url);
	const imageUrl = article.imageUrl || DEFAULT_BREAKING_NEWS_IMAGE;

	return replaceTemplateTokens({
		article_url: escapeHtml(articleUrlWithBraze),
		body: escapeHtml(article.body),
		body_preview_marker: markerAttribute('body', includePreviewMarkers),
		email_date: escapeHtml(formatBreakingNewsDate(now)),
		email_subject: escapeHtml(
			article.subject || 'Breaking News US | The Guardian',
		),
		headline: escapeHtml(article.headline),
		headline_link_preview_marker: markerAttribute(
			'headline-link',
			includePreviewMarkers,
		),
		headline_preview_marker: markerAttribute('headline', includePreviewMarkers),
		image_link_preview_marker: markerAttribute(
			'image-link',
			includePreviewMarkers,
		),
		image_preview_marker: markerAttribute('image', includePreviewMarkers),
		image_url: escapeHtml(imageUrl),
	});
};
