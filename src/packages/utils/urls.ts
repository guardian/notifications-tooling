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

	// Split on `/` (dropping empty segments from leading/trailing/double slashes)
	// rather than trimming with a regex, which CodeQL flags as ReDoS-prone.
	const segments = candidate.split('/').filter(Boolean);
	if (
		segments.length < 2 ||
		!segments.every((segment) => articleIdSegment.test(segment))
	) {
		return undefined;
	}

	return segments.join('/');
};

/** The prefix a liveblog deep-link uses to name a block in `?page=`. */
const withBlockPrefix = 'with:block-';

/** A liveblog block id: word chars and hyphens (CAPI block ids / UUIDs). */
const blockIdSegment = /^[\w-]+$/;

/**
 * Extracts the liveblog block id from a Guardian article URL that deep-links to
 * a single block. Such links carry `?page=with:block-<id>` (and usually a
 * matching `#block-<id>` fragment), which `determineArticleId` deliberately
 * drops when resolving the content id. Sending the block id to mobile-n10n lets
 * the apps open the liveblog at that block; without it they open at the top.
 *
 * Returns `undefined` for a bare article id, a non-`http(s)` URL, or any link
 * without a block reference.
 */
export const determineBlockId = (input: string): string | undefined => {
	let url: URL;
	try {
		url = new URL(input.trim());
	} catch {
		return undefined;
	}

	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return undefined;
	}

	const page = url.searchParams.get('page');
	const fromQuery = page?.startsWith(withBlockPrefix)
		? page.slice(withBlockPrefix.length)
		: undefined;
	const fromHash = url.hash.startsWith('#block-')
		? url.hash.slice('#block-'.length)
		: undefined;

	const blockId = fromQuery ?? fromHash;
	return blockId && blockIdSegment.test(blockId) ? blockId : undefined;
};
