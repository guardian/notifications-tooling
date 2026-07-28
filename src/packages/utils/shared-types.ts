/**
 * The authenticated user, as decoded from the pan-domain (Panda) cookie by
 * `pan-domain-node`. Mirrors that library's `User` interface so this mock can
 * be swapped for real Panda verification without changing the response shape.
 */
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

/**
 * A permission granted to the user, as registered in the Guardian `permissions`
 * model. Mirrors that model's `Permission(app, description)` shape, keyed by the
 * permission `name`, so this mock can be swapped for the real permissions store
 * without changing the response shape.
 */
export interface Permission {
	/** The permission name, e.g. `DispatchAccess`. */
	name: string;
	/** Human-readable description of what the permission grants. */
	description: string;
	/** Whether the permission is currently granted to the user. */
	active: boolean;
}

/** The `GET /v1/user` response: the authenticated user and their permissions. */
export interface UserResponse {
	user: User;
	permissions: Permission[];
}
