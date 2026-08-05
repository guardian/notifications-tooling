import { guardianUrlDomains } from '@config';

/** Returns `true` when `value` is a valid `https` URL on a Guardian domain. */
export const isGuardianUrl = (value: string): boolean => {
	let url: URL;

	try {
		url = new URL(value);
	} catch {
		return false;
	}

	if (url.protocol !== 'https:') {
		return false;
	}

	return guardianUrlDomains.some(
		(domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
	);
};

/**
 * Extracts the CAPI content id from a Guardian article URL. The content id is
 * the URL pathname (leading/trailing slashes removed), which for an article is
 * at least two segments (e.g. `environment/2026/jul/19/a-headline`).
 *
 * Returns `undefined` when `value` is not an `https` Guardian URL or its path
 * is too short to be an article.
 */
export const guardianArticleIdFromUrl = (value: string): string | undefined => {
	if (!isGuardianUrl(value)) {
		return undefined;
	}

	const articleId = new URL(value).pathname.replace(/^\/+|\/+$/g, '');
	if (articleId.split('/').filter(Boolean).length < 2) {
		return undefined;
	}

	return articleId;
};
