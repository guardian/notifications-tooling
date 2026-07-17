/**
 * The base domains we accept as valid Guardian article links. Any exact match
 * or subdomain (e.g. `www.`, `amp.`) of these is treated as a Guardian URL.
 */
export const guardianUrlDomains = ['theguardian.com', 'gu.com'] as const;

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
