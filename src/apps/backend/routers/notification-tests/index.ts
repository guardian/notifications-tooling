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
	toPublicDispatch,
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

			// Persist the envelope and each dispatch outcome, then expose the
			// stored rows so the caller sees exactly what was recorded.
			const { notification, dispatches } = await persistNotification({
				testId,
				request: body,
				createdByEmail: req.user!.email,
				outcomes,
			});

			req.log.info(
				{
					testId,
					dryRun: body.options.dryRun,
					status: notification.status,
					...outcomes,
				},
				'Dispatched and recorded notification test',
			);

			res.status(202).json({
				testId,
				status: 'accepted',
				dryRun: body.options.dryRun,
				plans: Object.keys(body.channels).map((channel) => ({
					channel,
					planId: `${testId}#${channel}`,
					status: 'accepted',
				})),
				dispatches: dispatches.map(toPublicDispatch),
				statusUrl: `/v1/notification-tests/${testId}/status`,
			});
		},
	);

export const notificationTestsRouter = createNotificationTestsRouter();
