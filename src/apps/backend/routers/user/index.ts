import { type Request, type Response, Router } from 'express';

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

/**
 * A stand-in for the user Panda would resolve from the shared cookie. Used
 * until `pan-domain-node` verification is wired into the backend so the SPA can
 * develop against a stable `GET /v1/user` contract.
 */
export const sampleUser: User = {
	firstName: 'Ada',
	lastName: 'Lovelace',
	email: 'ada.lovelace@guardian.co.uk',
	avatarUrl: 'https://avatars.example.com/ada-lovelace.png',
	authenticatingSystem: 'notifications-tooling',
	authenticatedIn: ['notifications-tooling'],
	expires: Date.now() + 60 * 60 * 1000,
	multifactor: true,
};

/**
 * A stand-in for the permissions the Guardian `permissions` store would resolve
 * for the user. Seeded with `DispatchAccess` — the permission registered for
 * the `Dispatch` app (breaking news emails / notifications) in
 * guardian/permissions#400.
 */
export const samplePermissions: Permission[] = [
	{
		name: 'DispatchAccess',
		description: 'Access to Dispatch',
		active: true,
	},
];

/**
 * `GET /v1/user`. Returns the authenticated user (under `user`) and their
 * permissions. This is currently a mock returning {@link sampleUser} and
 * {@link samplePermissions}; it will be backed by pan-domain-node cookie
 * verification and the permissions store once they are integrated.
 */
export const userHandler = (_req: Request, res: Response) => {
	const body: UserResponse = {
		user: sampleUser,
		permissions: samplePermissions,
	};
	res.json(body);
};

export const userRouter = Router().get('/', userHandler);
