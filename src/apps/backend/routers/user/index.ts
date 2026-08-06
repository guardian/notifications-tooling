import type { UserResponse } from '@models';
import { type Request, type Response, Router } from 'express';
import { authMiddleware } from '../../middleware/auth-middleware';
import { listUserPermissions } from '../../utils/permissions/permissions-store';

export const userHandler = async (req: Request, res: Response) => {
	const user = req.user!;
	const body: UserResponse = {
		user,
		permissions: await listUserPermissions(user.email),
	};
	res.json(body);
};

export const userRouter = Router().get('/', authMiddleware, userHandler);
