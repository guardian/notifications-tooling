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

/** A single path segment of a CAPI content id: word chars and hyphens. */
const articleIdSegment = /^[\w-]+$/;

/** A CAPI content id is two or more such segments joined by `/`. */
const isArticleIdShape = (candidate: string): boolean => {
	const segments = candidate.split('/').filter(Boolean);
	return (
		segments.length >= 2 &&
		segments.every((segment) => articleIdSegment.test(segment))
	);
};

/**
 * Determines the CAPI content id from user input that is either a bare article
 * id (`section/2026/jul/19/slug`) or any Guardian-family URL — a public
 * front-end (`www`/`amp`/`m`), a `gu.com` short domain, or an internal gutools
 * preview/viewer link. CAPI resolves by id, and that id is the URL pathname
 * regardless of which front-end produced the link, so we take the path.
 *
 * Returns `undefined` when the input is neither a plausible bare id nor an
 * `http(s)` URL whose path looks like one.
 */
export const determineArticleId = (input: string): string | undefined => {
	const trimmed = input.trim();
	if (trimmed === '') {
		return undefined;
	}

	let candidate = trimmed;
	try {
		const url = new URL(trimmed);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return undefined;
		}
		candidate = url.pathname;
	} catch {
		// Not a URL: treat the whole input as a bare article id / path.
	}

	const articleId = candidate.replace(/^\/+|\/+$/g, '');
	return isArticleIdShape(articleId) ? articleId : undefined;
};
