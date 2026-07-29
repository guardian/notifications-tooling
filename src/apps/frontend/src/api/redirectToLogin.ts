/**
 * Sends the browser to pan-domain login. Isolated in its own module so
 * `client.ts` stays testable — a test can stub this rather than trying to
 * intercept a real navigation.
 */
export const redirectToLogin = (loginUrl: string): void => {
	globalThis.location.href = loginUrl;
};
