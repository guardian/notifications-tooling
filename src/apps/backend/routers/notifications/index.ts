import { randomUUID } from 'node:crypto';
import {
	createNotificationsRepository,
	getDb,
	type NotificationDispatch,
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
	type NotificationSendRequest,
	notificationSendRequestSchema,
} from './schemas/notification-send-request';

/** How long (seconds) an accepted notification may still be cancelled. */
const CANCELLATION_WINDOW_SECONDS = 5 * 60;

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

const serializeDispatch = (dispatch: NotificationDispatch) => ({
	id: dispatch.id,
	channel: dispatch.channel,
	target: dispatch.target,
	providerRef: dispatch.providerRef,
	status: dispatch.status,
	failureReason: dispatch.failureReason,
	providerStatusCode: dispatch.providerStatusCode,
	detail: dispatch.detail,
	createdAt: dispatch.createdAt,
	updatedAt: dispatch.updatedAt,
});

/** Shapes a stored notification and its dispatches into the API response. */
const serializeNotification = (notification: NotificationWithDispatches) => ({
	id: notification.id,
	idempotencyKey: notification.idempotencyKey,
	kind: notification.kind,
	status: notification.status,
	sender: notification.sender,
	createdByEmail: notification.createdByEmail,
	dryRun: notification.dryRun,
	scheduledFor: notification.scheduledFor,
	content: notification.content,
	channels: notification.channels,
	createdAt: notification.createdAt,
	updatedAt: notification.updatedAt,
	dispatches: notification.dispatches.map(serializeDispatch),
});

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
	findNotification: FindNotificationById = findNotificationByIdWithDispatches,
) => {
	const notificationsRouter = Router();

	notificationsRouter.post(
		'/',
		authMiddleware,
		requirePermissions([UserPermissions.DispatchAccess]),
		validate({
			body: notificationSendRequestSchema,
			handler: handleValidationErrors,
		}),
		async (req, res) => {
			const body = req.body;

			// Mint the id before dispatch so each channel adapter can tag its
			// downstream calls with it. Becomes the store's primary key later.
			const notificationId = randomUUID();
			const { appPush, newsletter } = await dispatchRequest(
				body,
				notificationId,
			);

			// Outcomes are not persisted yet; log them so sends can be introspected.
			req.log.info(
				{ notificationId, appPush, newsletter },
				'Dispatched notification channels',
			);

			const statusUrl = `/v1/notifications/${notificationId}/status`;

			const plans = Object.keys(body.channels).map((channel) => ({
				channel,
				planId: `${notificationId}#${channel}`,
				status: 'accepted' as const,
			}));

			const expiresAt =
				Math.floor(Date.now() / 1000) + CANCELLATION_WINDOW_SECONDS;

			res.status(202).json({
				notificationId,
				status: 'accepted',
				plans,
				statusUrl,
				cancellable: {
					cancelUrl: `/v1/notifications/${notificationId}/cancel`,
					expiresAt,
				},
			});
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

			res.status(200).json(serializeNotification(notification));
		},
	);

	return notificationsRouter;
};

export const notificationsRouter = createNotificationsRouter();
