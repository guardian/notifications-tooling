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

export interface UserResponse {
	user: User;
	permissions: string[];
}

declare global {
	interface Window {
		/**
		 * The `UserResponse` injected into `index.html` by the backend's
		 * `serveIndex` middleware, available before the app mounts.
		 */
		__APP_CONFIG__?: UserResponse;
	}
}

export const getUser = async (): Promise<UserResponse> => {
	const config = window.__APP_CONFIG__;
	if (!config) {
		throw new Error('window.__APP_CONFIG__ was not injected into the page');
	}
	return await Promise.resolve(config);
};
