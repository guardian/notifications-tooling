/**
 * Sends the browser to pan-domain login. Isolated in its own module so
 * `client.ts` stays testable — a test can stub this rather than trying to
 * intercept a real navigation.
 *
 * The backend supplies a bare login URL because only it knows the
 * stage-to-login-host mapping; the `returnUrl` is added here because only the
 * browser knows which page is open. Reading it from `location.href` rather than
 * the failed request's URL is what stops a successful login landing the user on
 * a raw JSON API response. See docs/ADRs/login-redirect-ownership.md.
 */
export const redirectToLogin = (loginUrl: string): void => {
	const url = new URL(loginUrl);
	url.searchParams.set('returnUrl', globalThis.location.href);
	globalThis.location.href = url.toString();
};
