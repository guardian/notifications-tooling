const DEFAULT_ORIGIN = 'https://www.theguardian.com';
// the path to a guardian article is made up at least two segments, usually in the format
// /section-name/YYYY/MMM/DD/article-headline-converted-to-kebab-case
const articleUrlPathPattern = /^(\/([\w-]+)){2,}$/;

const trimTrailingSlash = (rawPath: string): string =>
	rawPath.endsWith('/') ? rawPath.substring(0, rawPath.length - 1) : rawPath;

const trimLeadingSlash = (rawPath: string): string =>
	rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;

const guardianUrlDomains = ['theguardian.com', 'gu.com'];

export type ArticleUrlInputFailure =
	'not-guardian-url' | 'incomplete-article-url' | 'invalid-url';

export const getArticleUrlInputFailureMessage = (
	failure: ArticleUrlInputFailure,
): string => {
	switch (failure) {
		case 'not-guardian-url':
			return 'Paste a Guardian article URL beginning with https://.';
		case 'incomplete-article-url':
			return 'This Guardian link looks incomplete. Paste the full article URL.';
		case 'invalid-url':
			return 'Paste a complete Guardian article URL, for example https://www.theguardian.com/world/2026/sep/08/article.';
	}
};

export const parseArticleUrlInputToContentId = (
	articleInputText: string,
): {
	articleId?: string;
	failure?: ArticleUrlInputFailure;
	webUrl?: string;
} => {
	if (articleInputText.length === 0) {
		return {};
	}

	try {
		const url = new URL(articleInputText);

		const isGuardianDomain = guardianUrlDomains.some(
			(domain) =>
				url.hostname === domain || url.hostname.endsWith(`.${domain}`),
		);
		if (url.protocol !== 'https:' || !isGuardianDomain) {
			return {
				failure: 'not-guardian-url',
			};
		}
		const pathname = trimTrailingSlash(url.pathname);
		if (!articleUrlPathPattern.test(pathname)) {
			return {
				failure: 'incomplete-article-url',
			};
		}

		// the id of the article is the path with the leading slash removed
		return {
			articleId: trimLeadingSlash(pathname),
			webUrl: `${url.origin}${pathname}`,
		};
	} catch {
		// If it is not a URL, check whether it is a valid article id.
		const maybeInputtedArticleId = trimLeadingSlash(articleInputText);
		if (articleUrlPathPattern.test(`/${maybeInputtedArticleId}`)) {
			return {
				articleId: maybeInputtedArticleId,
				webUrl: `${DEFAULT_ORIGIN}/${maybeInputtedArticleId}`,
			};
		}
		return { failure: 'invalid-url' };
	}
};

const emailPattern = /^[+a-zA-Z0-9_.'-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,6}$/;
const emailDomainWhitelist = ['theguardian.com', 'guardian.co.uk'];
export const validateGuardianEmail = (emailInput: string) => {
	if (!emailPattern.test(emailInput)) {
		return 'not a valid email';
	}
	const domain = emailInput.toLowerCase().split('@').pop();
	if (!domain || !emailDomainWhitelist.includes(domain)) {
		return 'not a guardian email address';
	}
	return undefined;
};
