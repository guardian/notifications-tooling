import type { User } from '@config';

export interface AppConfig {
	user: User;
	permissions: string[];
}

declare global {
	interface Window {
		/**
		 * The `AppConfig` injected into `index.html` by the backend's
		 * `serveIndex` middleware, available before the app mounts.
		 */
		__APP_CONFIG__?: AppConfig;
	}
}

export const getAppConfig = (): Promise<AppConfig | undefined> => {
	return fetch('/v1/user')
		.then((r) => r.json())
		.then((data) => {
			console.log(data);
			return data as AppConfig;
		});
};
