import { UserPermissions } from '@models';
import { Router } from 'express';
import validate from 'express-zod-safe';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import {
	dispatchNotificationTest,
	type TestDispatchOutcomes,
} from '../../notification-channels/dispatch-notification-test';
import {
	httpStatusForNotification,
	type TestNotificationStore,
	testNotificationStore,
	toNotificationResponse,
} from '../../persistence/persist-notification';
import { dispatchAndPersistNotification } from '../dispatch-and-persist-notification';
import { handleValidationErrors } from '../notifications';
import {
	type NotificationTestSendRequest,
	notificationTestSendRequestSchema,
} from '../notifications/schemas/notification-send-request';

type DispatchValidatedNotificationTest = (
	request: NotificationTestSendRequest,
	testId: string,
	createdByEmail: string,
) => Promise<TestDispatchOutcomes>;

export const createNotificationTestsRouter = (
	dispatchRequest: DispatchValidatedNotificationTest = dispatchNotificationTest,
	store: TestNotificationStore = testNotificationStore,
) =>
	Router().post(
		'/',
		authMiddleware,
		requirePermissions([
			UserPermissions.DispatchAccess,
			UserPermissions.SendNotification,
		]),
		validate({
			body: notificationTestSendRequestSchema,
			handler: handleValidationErrors,
		}),
		async (req, res) => {
			const body = req.body;
			const result = await dispatchAndPersistNotification({
				request: body,
				createdByEmail: req.user!.email,
				dispatchRequest,
				store,
			});

			if (result.type === 'recorded') {
				if (result.providerError !== undefined) {
					req.log.warn(
						{
							testId: result.notification.id,
							dryRun: body.options.dryRun,
							status: result.persisted.notification.status,
							err: result.providerError,
							...result.outcomes,
						},
						'Recorded notification test with provider failures',
					);
				} else {
					req.log.info(
						{
							testId: result.notification.id,
							dryRun: body.options.dryRun,
							status: result.persisted.notification.status,
							...result.outcomes,
						},
						'Dispatched and recorded notification test',
					);
				}

				res
					.status(
						httpStatusForNotification(result.persisted.notification.status),
					)
					.json(toNotificationResponse(result.persisted));
				return;
			}

			req.log.error(
				{
					err: result.dispatchError,
					testId: result.notification.id,
				},
				'Notification test dispatch or outcome persistence failed',
			);
			if (result.markFailedError !== undefined) {
				req.log.error(
					{
						err: result.markFailedError,
						testId: result.notification.id,
					},
					'Failed to persist notification test failure status',
				);
			}

			res
				.status(httpStatusForNotification(result.failedNotification.status))
				.json(
					toNotificationResponse({
						notification: result.failedNotification,
						dispatches: [],
					}),
				);
		},
	);

export const notificationTestsRouter = createNotificationTestsRouter();
