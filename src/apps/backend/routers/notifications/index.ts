import {
	createNotificationsRepository,
	getDb,
	type ListDistinctSendersOptions,
	type ListRecentNotificationsOptions,
	type NotificationListPage,
	type NotificationWithDispatches,
} from '@database';
import { UserPermissions } from '@models';
import { type RequestHandler, Router } from 'express';
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
	toNotificationSummary,
} from '../../persistence/persist-notification';
import { dispatchAndPersistNotification } from '../dispatch-and-persist-notification';
import {
	notificationListQuerySchema,
	notificationSendersQuerySchema,
} from './schemas/notification-list-query';
import type {
	NotificationListQuery,
	NotificationSendersQuery,
} from './schemas/notification-list-query';
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

const validationErrorDetails = (errors: Parameters<ErrorRequestHandler>[0]) =>
	errors.flatMap((item) =>
		item.errors.issues.map((issue) => ({
			code: issue.code,
			path: toJsonPointer(issue.path),
			message: issue.message,
		})),
	);

const createBadRequestValidationHandler =
	(message: string): ErrorRequestHandler =>
	(errors, req, res) => {
		res.status(400).json({
			...buildErrorEnvelope(req, 'bad_request', message),
			details: validationErrorDetails(errors),
		});
	};

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
	const details = validationErrorDetails(errors);

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
export const handleNotificationIdValidationError =
	createBadRequestValidationHandler(
		'The notification id must be a valid UUID.',
	);

/**
 * express-zod-safe error hook for `GET /v1/notifications`. Malformed query
 * params are always a structural `400`.
 */
export const handleNotificationListValidationError =
	createBadRequestValidationHandler(
		'The notification list query parameters are invalid.',
	);

/**
 * express-zod-safe error hook for `GET /v1/notifications/senders`. Malformed
 * query params are always a structural `400`.
 */
export const handleNotificationSendersValidationError =
	createBadRequestValidationHandler(
		'The notification senders query parameters are invalid.',
	);

type FindNotificationById = (
	id: string,
) => Promise<NotificationWithDispatches | null>;

const findNotificationByIdWithDispatches: FindNotificationById = async (id) => {
	const db = await getDb();
	return createNotificationsRepository(db).findByIdWithDispatches(id);
};

type ListRecentNotifications = (
	options: ListRecentNotificationsOptions,
) => Promise<NotificationListPage>;

const listRecentNotifications: ListRecentNotifications = async (options) => {
	const db = await getDb();
	return createNotificationsRepository(db).listRecent(options);
};

type ListDistinctSenders = (
	options: ListDistinctSendersOptions,
) => Promise<string[]>;

const listDistinctSenders: ListDistinctSenders = async (options) => {
	const db = await getDb();
	return createNotificationsRepository(db).listDistinctSenders(options);
};

type DispatchValidatedNotification = (
	request: NotificationSendRequest,
	notificationId: string,
	createdByEmail: string,
) => Promise<DispatchOutcomes>;

export const createNotificationsRouter = (
	dispatchRequest: DispatchValidatedNotification = dispatchNotification,
	store: SendNotificationStore = sendNotificationStore,
	findNotification: FindNotificationById = findNotificationByIdWithDispatches,
	listNotifications: ListRecentNotifications = listRecentNotifications,
	listSenders: ListDistinctSenders = listDistinctSenders,
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
							notificationId: result.notification.id,
							status: result.persisted.notification.status,
							err: result.providerError,
							...result.outcomes,
						},
						'Recorded notification with provider failures',
					);
				} else {
					req.log.info(
						{
							notificationId: result.notification.id,
							status: result.persisted.notification.status,
							...result.outcomes,
						},
						'Dispatched and recorded notification channels',
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
					notificationId: result.notification.id,
				},
				'Notification dispatch or outcome persistence failed',
			);
			if (result.markFailedError !== undefined) {
				req.log.error(
					{
						err: result.markFailedError,
						notificationId: result.notification.id,
					},
					'Failed to persist notification failure status',
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

	notificationsRouter.get(
		'/',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		// Cast to a plain handler: the schema's transform narrows `query` to
		// numbers, which is not assignable from Express's `ParsedQs` overload.
		validate({
			query: notificationListQuerySchema,
			handler: handleNotificationListValidationError,
		}) as unknown as RequestHandler,
		async (req, res) => {
			// express-zod-safe has coerced the query and applied the defaults.
			const {
				since,
				limit,
				offset,
				search,
				articleId,
				createdByEmails,
				channels,
				audiences,
				statuses,
				alertTypes,
			} = req.query as unknown as NotificationListQuery;
			const { notifications, total } = await listNotifications({
				since,
				limit,
				offset,
				search,
				articleId,
				createdByEmails,
				channels,
				audiences,
				statuses,
				alertTypes,
			});

			res.status(200).json({
				total,
				limit,
				offset,
				notifications: notifications.map(toNotificationSummary),
			});
		},
	);

	// Registered before `/:id` so `senders` is matched by this handler rather
	// than treated as a notification id.
	notificationsRouter.get(
		'/senders',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		// Cast to a plain handler: the schema's transform narrows `query`, which is
		// not assignable from Express's `ParsedQs` overload.
		validate({
			query: notificationSendersQuerySchema,
			handler: handleNotificationSendersValidationError,
		}) as unknown as RequestHandler,
		async (req, res) => {
			const { since } = req.query as unknown as NotificationSendersQuery;
			const senders = await listSenders({ since });

			res.status(200).json({ senders });
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
