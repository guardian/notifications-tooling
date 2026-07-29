import { NextFunction, Request, Response } from 'express';
import { UserPermissions } from '@config';
import { listUserPermissions } from '../utils/permissions/permissions-store';

function respondWithInsufficientPermissions(response: Response) {
	return response.status(403).json({
		error: 'insufficient_permissions',
		message: 'You do not have permission to access this resource.',
	});
}

export const requirePermissions =
	(requiredPermissions: UserPermissions[]) =>
	async (request: Request, response: Response, next: NextFunction) => {
		if (!request.user) {
			return respondWithInsufficientPermissions(response);
		}

		const userPermissions = await listUserPermissions(request.user.email);
		const hasAllPermissions = requiredPermissions.every((permission) =>
			userPermissions.includes(permission),
		);

		if (!hasAllPermissions) {
			return respondWithInsufficientPermissions(response);
		}

		return next();
	};
