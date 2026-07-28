import type { User } from '@guardian/pan-domain-node';
import { type Request, type Response, Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware';
import { listUserPermissions } from '../../utils/permissions/permissions-store';

export type { User };

export interface UserResponse {
	user: User;
	permissions: string[];
}

export const userHandler = async (req: Request, res: Response) => {
	const user = req.user!;
	const body: UserResponse = {
		user,
		permissions: await listUserPermissions(user.email),
	};
	res.json(body);
};

export const userRouter = Router().get('/', authMiddleware, userHandler);
