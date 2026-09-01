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

			let outcomesRecorded = false;
			try {
				const { error, ...outcomes } = await dispatchRequest(
					body,
					notification.id,
				);
				const persisted = await store.recordOutcomes(notification, outcomes);
				outcomesRecorded = true;

				// A provider rejection is reflected in the persisted dispatch rows and
				// the rolled-up status (any failure -> 502), so return the recorded
				// notification either way — the caller sees each target's outcome
				// instead of a terse error envelope.
				if (error !== undefined) {
					req.log.warn(
						{
							testId: notification.id,
							dryRun: body.options.dryRun,
							status: persisted.notification.status,
							err: error,
							...outcomes,
						},
						'Recorded notification test with provider failures',
					);
				} else {
					req.log.info(
						{
							testId: notification.id,
							dryRun: body.options.dryRun,
							status: persisted.notification.status,
							...outcomes,
						},
						'Dispatched and recorded notification test',
					);
				}

				res
					.status(httpStatusForNotification(persisted.notification.status))
					.json(toNotificationResponse(persisted));
			} catch (error) {
				// Dispatch or persistence threw before any outcome was recorded (e.g.
				// a config, SSM, or DB failure); flag the stored row failed and return
				// it so the caller sees the failure rather than a terse error
				// envelope. When outcomes were recorded the status is already
				// accurate, so rethrow to surface anything unexpected.
				if (!outcomesRecorded) {
					const failed = await store
						.markFailed(notification)
						.catch(() => notification);

					res
						.status(httpStatusForNotification(failed.status))
						.json(
							toNotificationResponse({ notification: failed, dispatches: [] }),
						);

					return;
				}

				throw error;
			}
		},
	);

export const notificationTestsRouter = createNotificationTestsRouter();
