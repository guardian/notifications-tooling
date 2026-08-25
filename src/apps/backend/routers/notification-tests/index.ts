import { randomUUID } from 'node:crypto';
import { UserPermissions } from '@config';
import { Router } from 'express';
import validate from 'express-zod-safe';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import {
	dispatchNotificationTest,
	type TestDispatchOutcomes,
} from '../../notification-channels/dispatch-notification-test';
import {
	type PersistTestNotification,
	persistTestNotification,
	toNotificationResponse,
} from '../../persistence/persist-notification';
import { handleValidationErrors } from '../notifications';
import {
	type NotificationTestSendRequest,
	notificationTestSendRequestSchema,
} from '../notifications/schemas/notification-send-request';

type DispatchValidatedNotificationTest = (
	request: NotificationTestSendRequest,
	testId: string,
) => Promise<TestDispatchOutcomes>;

export const createNotificationTestsRouter = (
	dispatchRequest: DispatchValidatedNotificationTest = dispatchNotificationTest,
	persistNotification: PersistTestNotification = persistTestNotification,
) =>
	Router().post(
		'/',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		validate({
			body: notificationTestSendRequestSchema,
			handler: handleValidationErrors,
		}),
		async (req, res) => {
			const body = req.body;

			const testId = randomUUID();
			const outcomes = await dispatchRequest(body, testId);

			// Persist the envelope and each dispatch outcome, then return the
			// stored notification resource so the caller sees exactly what was
			// recorded and how each channel fared.
			const persisted = await persistNotification({
				testId,
				request: body,
				createdByEmail: req.user!.email,
				outcomes,
			});

			req.log.info(
				{
					testId,
					dryRun: body.options.dryRun,
					status: persisted.notification.status,
					...outcomes,
				},
				'Dispatched and recorded notification test',
			);

			res.status(202).json(toNotificationResponse(persisted));
		},
	);

export const notificationTestsRouter = createNotificationTestsRouter();
