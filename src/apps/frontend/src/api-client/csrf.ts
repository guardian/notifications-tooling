/**
 * The host-locked CSRF cookie the backend sets on the document, echoed back in
 * {@link CSRF_HEADER_NAME} on every state-changing request so the server can
 * confirm the call came from the Dispatch SPA (double-submit pattern).
 */
export const CSRF_COOKIE_NAME = '__Host-dispatch-csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/** Reads the double-submit CSRF token, or `undefined` if it is not present. */
export const readCsrfToken = (): string | undefined => {
	for (const part of document.cookie.split('; ')) {
		if (part.startsWith(`${CSRF_COOKIE_NAME}=`)) {
			return part.slice(CSRF_COOKIE_NAME.length + 1) || undefined;
		}
	}
	return undefined;
};
