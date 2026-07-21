import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import validate, { type ErrorRequestHandler } from 'express-zod-safe';
import { notificationSendRequestSchema } from './schemas/notification-send-request';

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
const handleValidationErrors: ErrorRequestHandler = (errors, req, res) => {
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
		error: isStructural ? 'bad_request' : 'validation_failed',
		message: isStructural
			? 'The request body is malformed.'
			: 'The notification request failed validation. See details.',
		requestId: (req as { id?: string }).id,
		details,
	});
};

export const notificationsRouter = Router();

notificationsRouter.post(
	'/',
	validate({
		body: notificationSendRequestSchema,
		handler: handleValidationErrors,
	}),
	(req, res) => {
		const body = req.body;

		// No persistence layer yet, so mint the id in-process. Once a store exists
		// this becomes the primary key the channel adapters update.
		const notificationId = randomUUID();
		const statusUrl = `/v1/notifications/${notificationId}/status`;

		const plans = body.channels.map((plan) => ({
			channel: plan.channel,
			planId: `${notificationId}#${plan.channel}`,
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
