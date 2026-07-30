import type { UserPermissions } from '@config';
import type { NextFunction, Request, Response } from 'express';
import { checkPermissions } from '../utils/permissions/check-permissions';

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

		const hasAllPermissions = await checkPermissions(
			request.user.email,
			requiredPermissions,
		);

		if (!hasAllPermissions) {
			return respondWithInsufficientPermissions(response);
		}

		return next();
	};
