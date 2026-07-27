export interface User {
	firstName: string;
	lastName: string;
	email: string;
	/** Optional profile picture URL; absent when the provider supplies none. */
	avatarUrl?: string;
	/** The app that issued the login. */
	authenticatingSystem: string;
	/** The apps the user has been validated in. */
	authenticatedIn: string[];
	/** Cookie expiry as epoch milliseconds. */
	expires: number;
	/** Whether the login was made with multi-factor authentication. */
	multifactor: boolean;
}

export interface Permission {
	/** The permission name, e.g. `DispatchAccess`. */
	name: string;
	/** Human-readable description of what the permission grants. */
	description: string;
	/** Whether the permission is currently granted to the user. */
	active: boolean;
}

export interface UserResponse {
	user: User;
	permissions: Permission[];
}

export type TabName = 'create' | 'history';
