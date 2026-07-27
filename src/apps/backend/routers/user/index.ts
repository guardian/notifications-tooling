import type { User } from '@guardian/pan-domain-node';
import { type Request, type Response, Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware';

export type { User };

export interface Permission {
	name: string;
	description: string;
	active: boolean;
}

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

export interface UserResponse {
	user: User;
	permissions: Permission[];
}

export const userHandler = (req: Request, res: Response) => {
	const body: UserResponse = {
		user: req.user!,
		permissions: samplePermissions,
	};
	res.json(body);
};

export const userRouter = Router().get('/', authMiddleware, userHandler);
