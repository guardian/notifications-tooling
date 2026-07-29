import type { UserResponse } from '@utils';

declare global {
	interface Window {
		/**
		 * The `UserResponse` injected into `index.html` by the backend's
		 * `serveIndex` middleware, available before the app mounts.
		 */
		__APP_CONFIG__?: UserResponse;
	}
}

export const getUser = (): UserResponse => {
	const config = window.__APP_CONFIG__;
	if (!config) {
		throw new Error('window.__APP_CONFIG__ was not injected into the page');
	}
	return config;
};
