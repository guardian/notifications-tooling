// -copied from @guardian/pan-domain-node
// TO DO - export from the @config or @util package to
// avoid duplicating or importing the panda node library into frontend just for the type
interface User {
	firstName: string;
	lastName: string;
	email: string;
	avatarUrl?: string;
	authenticatingSystem: string;
	authenticatedIn: string[];
	expires: number;
	multifactor: boolean;
}

export interface AppConfig {
	user: User;
	permissions: string[];
}

declare global {
	interface Window {
		/**
		 * The `UserResponse` injected into `index.html` by the backend's
		 * `serveIndex` middleware, available before the app mounts.
		 */
		__APP_CONFIG__?: AppConfig;
	}
}

export const getAppConfig = (): AppConfig | undefined => {
	return window.__APP_CONFIG__;
};
