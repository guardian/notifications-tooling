import { beforeEach, describe, expect, it } from 'bun:test';
import { redirectToLogin } from './redirectToLogin';

describe('redirectToLogin', () => {
	beforeEach(() => {
		globalThis.history.replaceState(
			null,
			'',
			'/app-alert/create?draft=breaking-news#preview',
		);
	});

	it('redirects to login with the current page as the return URL', () => {
		redirectToLogin('https://login.gutools.co.uk/login?source=notifications');

		expect(globalThis.location.href).toBe(
			'https://login.gutools.co.uk/login?source=notifications&returnUrl=http%3A%2F%2Flocalhost%3A3000%2Fapp-alert%2Fcreate%3Fdraft%3Dbreaking-news%23preview',
		);
	});
});
