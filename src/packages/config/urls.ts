/**
 * The base domains we accept as valid Guardian article links. Any exact match
 * or subdomain (e.g. `www.`, `amp.`) of these is treated as a Guardian URL.
 */
export const guardianUrlDomains = ['theguardian.com', 'gu.com'] as const;
