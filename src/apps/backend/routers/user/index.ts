import type { User } from '@guardian/pan-domain-node';
import { type Request, type Response, Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware';

/**
 * The authenticated user, as decoded from the pan-domain (Panda) cookie by
 * `pan-domain-node`. Re-exported from that library so the response shape stays
 * in lockstep with the verifier that populates `req.user`.
 */
export type { User };

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
 * permissions. The user is read from `req.user`, populated by `authMiddleware`
 * from the verified pan-domain cookie; permissions are currently a mock
 * ({@link samplePermissions}) until the permissions store is integrated.
 */
export const userHandler = (req: Request, res: Response) => {
	const body: UserResponse = {
		// Non-null: `/v1/user` is mounted behind `authMiddleware`, which populates
		// `req.user` (or short-circuits with 401) before this handler runs.
		user: req.user!,
		permissions: samplePermissions,
	};
	res.json(body);
};

export const userRouter = Router().get('/', authMiddleware, userHandler);
