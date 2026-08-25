import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { UserPermissions } from '@models';
import type { User } from '@guardian/pan-domain-node';
import type { Request, Response } from 'express';
import { buildTestUser } from '../utils/test-utils/panda-auth';
import {
	grantPermissions,
	installPermissionsStoreMock,
	listUserPermissionsMock,
} from '../utils/test-utils/permissions';

// Stub the permissions store before importing the middleware so the real S3
// client is never constructed.
installPermissionsStoreMock();

const { requirePermissions } = await import('./permissions-middleware');

const testUser = buildTestUser();

const mockNextFunction = mock(() => undefined);

const createMockRequest = (user?: User): Request =>
	({
		user,
	}) as unknown as Request;

const createMockResponse = () => {
	const json = mock((body: unknown) => body);
	const status = mock(() => ({ json }));

	return {
		status,
		json,
		response: {
			status,
		} as unknown as Response,
	};
};

describe('permissions-middleware', () => {
	beforeEach(() => {
		grantPermissions([]);
	});

	afterEach(() => {
		mockNextFunction.mockReset();
		listUserPermissionsMock.mockReset();
	});

	it('responds with 403 where the request has no authenticated user', async () => {
		const request = createMockRequest();
		const { status, json, response } = createMockResponse();

		await requirePermissions([UserPermissions.DispatchAccess])(
			request,
			response,
			mockNextFunction,
		);

		expect(status).toHaveBeenCalledTimes(1);
		expect(status).toHaveBeenCalledWith(403);
		expect(json).toHaveBeenCalledWith({
			error: 'insufficient_permissions',
			message: 'You do not have permission to access this resource.',
		});
		expect(listUserPermissionsMock).not.toHaveBeenCalled();
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('responds with 403 where the user is missing a required permission', async () => {
		grantPermissions([]);
		const request = createMockRequest(testUser);
		const { status, json, response } = createMockResponse();

		await requirePermissions([UserPermissions.DispatchAccess])(
			request,
			response,
			mockNextFunction,
		);

		expect(listUserPermissionsMock).toHaveBeenCalledWith(testUser.email);
		expect(status).toHaveBeenCalledTimes(1);
		expect(status).toHaveBeenCalledWith(403);
		expect(json).toHaveBeenCalledWith({
			error: 'insufficient_permissions',
			message: 'You do not have permission to access this resource.',
		});
		expect(mockNextFunction).not.toHaveBeenCalled();
	});

	it('calls next where the user has all required permissions', async () => {
		grantPermissions([UserPermissions.DispatchAccess]);
		const request = createMockRequest(testUser);
		const { status, response } = createMockResponse();

		await requirePermissions([UserPermissions.DispatchAccess])(
			request,
			response,
			mockNextFunction,
		);

		expect(listUserPermissionsMock).toHaveBeenCalledWith(testUser.email);
		expect(status).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalledTimes(1);
	});

	it('calls next where no permissions are required', async () => {
		const request = createMockRequest(testUser);
		const { status, response } = createMockResponse();

		await requirePermissions([])(request, response, mockNextFunction);

		expect(status).not.toHaveBeenCalled();
		expect(mockNextFunction).toHaveBeenCalledTimes(1);
	});

	it('responds with 403 where only some of the required permissions are granted', async () => {
		grantPermissions([UserPermissions.DispatchAccess]);
		const request = createMockRequest(testUser);
		const { status, response } = createMockResponse();

		await requirePermissions([
			UserPermissions.DispatchAccess,
			'another_permission' as UserPermissions,
		])(request, response, mockNextFunction);

		expect(status).toHaveBeenCalledWith(403);
		expect(mockNextFunction).not.toHaveBeenCalled();
	});
});
