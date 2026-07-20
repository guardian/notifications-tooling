import { guardianUrlDomains } from '@config';

/**
 * Returns `true` when `value` is a syntactically valid, `https` Guardian URL.
 *
 * Links are provided as simple Guardian news article links, so we validate both
 * that the string is a real URL and that it points at a Guardian domain.
 */
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
