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
			webUrl: `${url.origin}${pathname}${url.search}${url.hash}`,
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

const gridCropPathPattern = /\/images\/([0-9a-f]{40})/i;
const gridCropParamPattern = /\d+_\d+_\d+_\d+/i;

type GridCropUrlValidationResult =
	| {
			success: true;
			validatedUrl: URL;
			cropId: string;
			imageId: string;
			validationError?: undefined;
	  }
	| {
			success: false;
			validationError?: string;
			validatedUrl?: undefined;
	  };

export const validateGridCropPageUrl = (
	imageUrl: string,
	gridOrigin: string | undefined,
): GridCropUrlValidationResult => {
	if (imageUrl.length === 0) {
		return { success: false };
	}

	try {
		const url = new URL(imageUrl);

		if (url.origin !== gridOrigin) {
			return {
				success: false,
				validationError: `Please enter a grid crop page, starting with ${gridOrigin}`,
			};
		}

		if (!gridCropPathPattern.test(url.pathname)) {
			return {
				success: false,
				validationError: `Please enter a grid crop page - this is not an image page`,
			};
		}

		const cropId = url.searchParams.get('crop') ?? '';
		if (!gridCropParamPattern.test(cropId)) {
			return {
				success: false,
				validationError: `Please enter a grid crop page - this needs the "crop" parameter`,
			};
		}

		return {
			success: true,
			validatedUrl: url,
			cropId,
			imageId: url.pathname.split('/').pop() ?? '',
		};
	} catch {
		return {
			success: false,
			validationError: `Please enter a grid crop page`,
		};
	}
};

const guardianImageUrlHosts = [
	'media.guim.co.uk',
	'i.guim.co.uk',
	'media.guimcode.co.uk',
];
export const guardianImageUrlValidationMessage =
	'Please enter a valid Guardian image URL';

export const validateGuardianImageUrl = (imageUrl: string) => {
	if (imageUrl.length === 0) {
		return undefined;
	}

	try {
		const url = new URL(imageUrl);
		const hasValidProtocol =
			url.protocol === 'https:' || url.protocol === 'http:';
		const hasValidHost = guardianImageUrlHosts.includes(url.host);
		const hasImagePath = url.pathname !== '/';

		return hasValidProtocol && hasValidHost && hasImagePath
			? undefined
			: guardianImageUrlValidationMessage;
	} catch {
		return guardianImageUrlValidationMessage;
	}
};
