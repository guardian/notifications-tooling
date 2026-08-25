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

			// Record the envelope first so the DB mints the id; the dispatch then
			// tags its downstream calls with that same id.
			const notification = await store.create(body, req.user!.email);

			try {
				const outcomes = await dispatchRequest(body, notification.id);
				const persisted = await store.recordOutcomes(notification, outcomes);

				req.log.info(
					{
						testId: notification.id,
						dryRun: body.options.dryRun,
						status: persisted.notification.status,
						...outcomes,
					},
					'Dispatched and recorded notification test',
				);

				res
					.status(httpStatusForNotification(persisted.notification.status))
					.json(toNotificationResponse(persisted));
			} catch (error) {
				// The row is already stored; flag it failed before the provider
				// error surfaces as the documented 502/504 via errorMiddleware.
				await store.markFailed(notification).catch(() => undefined);
				throw error;
			}
		},
	);

export const notificationTestsRouter = createNotificationTestsRouter();
