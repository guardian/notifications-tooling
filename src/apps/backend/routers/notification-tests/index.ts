import { randomUUID } from 'node:crypto';
import { UserPermissions } from '@config';
import { Router } from 'express';
import validate from 'express-zod-safe';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import {
	dispatchNotificationTest,
	type NewsletterTestDispatchOutcome,
} from '../../notification-channels/dispatch-notification';
import { handleValidationErrors } from '../notifications';
import {
	type NotificationTestSendRequest,
	notificationTestSendRequestSchema,
} from '../notifications/schemas/notification-send-request';

type DispatchValidatedNotificationTest = (
	request: NotificationTestSendRequest,
	testId: string,
) => Promise<NewsletterTestDispatchOutcome[]>;

export const createNotificationTestsRouter = (
	dispatchRequest: DispatchValidatedNotificationTest = dispatchNotificationTest,
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
			const newsletter = await dispatchRequest(body, testId);

			// Outcomes are not persisted yet; log them so tests can be introspected.
			req.log.info(
				{ testId, dryRun: body.options.dryRun, newsletter },
				'Dispatched notification test',
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
				statusUrl: `/v1/notification-tests/${testId}/status`,
			});
		},
	);

export const notificationTestsRouter = createNotificationTestsRouter();
