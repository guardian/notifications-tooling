import {
	createNotificationsRepository,
	getDb,
	type NotificationWithDispatches,
} from '@database';
import { UserPermissions } from '@models';
import { Router } from 'express';
import validate, { type ErrorRequestHandler } from 'express-zod-safe';
import { z } from 'zod';
import { buildErrorEnvelope } from '../../error-envelope';
import { authMiddleware } from '../../middleware/auth-middleware';
import { requirePermissions } from '../../middleware/permissions-middleware';
import {
	dispatchNotification,
	type DispatchOutcomes,
} from '../../notification-channels/dispatch-notification';
import {
	httpStatusForNotification,
	type SendNotificationStore,
	sendNotificationStore,
	toNotificationResponse,
} from '../../persistence/persist-notification';
import {
	type NotificationSendRequest,
	notificationSendRequestSchema,
} from './schemas/notification-send-request';

/**
 * Zod issue codes meaning the body is *structurally* wrong (a 400 per the
 * proposal). Everything else — length limits, unknown refs, `.superRefine`
 * rules — is a semantic 422.
 */
const STRUCTURAL_ISSUE_CODES = new Set([
	'invalid_type',
	'invalid_union',
	'invalid_value',
	'unrecognized_keys',
	'invalid_key',
	'invalid_element',
]);

/** Escapes a path segment for use in an RFC 6901 JSON Pointer. */
const toJsonPointer = (path: readonly PropertyKey[]): string =>
	`/${path
		.map((segment) => String(segment).replace(/~/g, '~0').replace(/\//g, '~1'))
		.join('/')}`;

/**
 * express-zod-safe error hook. Flattens the Zod issues into the proposal's
 * `{ error, message, requestId, details[] }` envelope and returns 400 for
 * structural failures or 422 for semantic/business failures.
 */
export const handleValidationErrors: ErrorRequestHandler = (
	errors,
	req,
	res,
) => {
	const details = errors.flatMap((item) =>
		item.errors.issues.map((issue) => ({
			code: issue.code,
			path: toJsonPointer(issue.path),
			message: issue.message,
		})),
	);

	const isStructural = errors.some((item) =>
		item.errors.issues.some((issue) => STRUCTURAL_ISSUE_CODES.has(issue.code)),
	);

	res.status(isStructural ? 400 : 422).json({
		...buildErrorEnvelope(
			req,
			isStructural ? 'bad_request' : 'validation_failed',
			isStructural
				? 'The request body is malformed.'
				: 'The notification request failed validation. See details.',
		),
		details,
	});
};

/** Route param: the stored notification's UUID primary key. */
const notificationIdParamsSchema = { id: z.uuid() };

/**
 * express-zod-safe error hook for `GET /v1/notifications/:id`. A non-UUID id
 * can never match a stored notification, so it is a structural `400` rather
 * than a `404`.
 */
export const handleNotificationIdValidationError: ErrorRequestHandler = (
	errors,
	req,
	res,
) => {
	const details = errors.flatMap((item) =>
		item.errors.issues.map((issue) => ({
			code: issue.code,
			path: toJsonPointer(issue.path),
			message: issue.message,
		})),
	);

	res.status(400).json({
		...buildErrorEnvelope(
			req,
			'bad_request',
			'The notification id must be a valid UUID.',
		),
		details,
	});
};

type FindNotificationById = (
	id: string,
) => Promise<NotificationWithDispatches | null>;

const findNotificationByIdWithDispatches: FindNotificationById = async (id) => {
	const db = await getDb();
	return createNotificationsRepository(db).findByIdWithDispatches(id);
};

type DispatchValidatedNotification = (
	request: NotificationSendRequest,
	notificationId: string,
) => Promise<DispatchOutcomes>;

export const createNotificationsRouter = (
	dispatchRequest: DispatchValidatedNotification = dispatchNotification,
	store: SendNotificationStore = sendNotificationStore,
	findNotification: FindNotificationById = findNotificationByIdWithDispatches,
) => {
	const notificationsRouter = Router();

	notificationsRouter.post(
		'/',
		authMiddleware,
		requirePermissions([
			UserPermissions.DispatchAccess,
			UserPermissions.SendNotification,
		]),
		validate({
			body: notificationSendRequestSchema,
			handler: handleValidationErrors,
		}),
		async (req, res) => {
			const body = req.body;

			// Record the envelope first so the DB mints the id; each channel
			// adapter then tags its downstream calls with that same id.
			const notification = await store.create(body, req.user!.email);

			try {
				const outcomes = await dispatchRequest(body, notification.id);
				const persisted = await store.recordOutcomes(notification, outcomes);

				req.log.info(
					{
						notificationId: notification.id,
						status: persisted.notification.status,
						...outcomes,
					},
					'Dispatched and recorded notification channels',
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

	notificationsRouter.get(
		'/:id',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		validate({
			params: notificationIdParamsSchema,
			handler: handleNotificationIdValidationError,
		}),
		async (req, res) => {
			const notification = await findNotification(req.params.id);

			if (!notification) {
				res
					.status(404)
					.json(
						buildErrorEnvelope(
							req,
							'not_found',
							'No notification exists with the given id.',
						),
					);
				return;
			}

			res.status(200).json(
				toNotificationResponse({
					notification,
					dispatches: notification.dispatches,
				}),
			);
		},
	);

	return notificationsRouter;
};

export const notificationsRouter = createNotificationsRouter();
