import type { Permission, User, UserResponse } from '@utils';
import { type Request, type Response, Router } from 'express';

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
