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
