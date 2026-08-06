import type { User } from '@models';

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

export const getAppConfig = (): AppConfig | undefined => {
	return window.__APP_CONFIG__;
};
