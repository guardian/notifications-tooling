import type { UserPermissions } from '@models';
import type { NextFunction, Request, Response } from 'express';
import { buildErrorEnvelope } from '../error-envelope';
import { listUserPermissions } from '../utils/permissions/permissions-store';

function respondWithInsufficientPermissions(
	request: Request,
	response: Response,
) {
	return response
		.status(403)
		.json(
			buildErrorEnvelope(
				request,
				'insufficient_permissions',
				'You do not have permission to access this resource.',
			),
		);
}

export const requirePermissions =
	(requiredPermissions: UserPermissions[]) =>
	async (request: Request, response: Response, next: NextFunction) => {
		if (!request.user) {
			return respondWithInsufficientPermissions(request, response);
		}

		const userPermissions = await listUserPermissions(request.user.email);
		const hasAllPermissions = requiredPermissions.every((permission) =>
			userPermissions.includes(permission),
		);

		if (!hasAllPermissions) {
			return respondWithInsufficientPermissions(request, response);
		}

		return next();
	};
