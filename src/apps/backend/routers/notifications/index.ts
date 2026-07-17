import { randomUUID } from 'node:crypto';
import { type Request, type Response, Router } from 'express';
import validate, { type ErrorRequestHandler } from 'express-zod-safe';
import { notificationPushRequestSchema } from './schemas/notification-push-request';

/**
 * How long (in seconds) a freshly-accepted notification may still be cancelled
 * before it is handed off to the downstream channel services.
 */
const CANCELLATION_WINDOW_SECONDS = 5 * 60;

/**
 * Zod issue codes that mean the body is *structurally* wrong (missing/typed
 * fields, unknown channel discriminator, extra keys). Per the proposal these
 * are a 400; everything else (length limits, unknown content refs, cross-field
 * rules from `.refine`/`.superRefine`) is a semantic 422.
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

notificationsRouter.get('/', (_req: Request, res: Response) => {
	res.json([{ id: 1, message: 'You have a new notification!' }]);
});

notificationsRouter.post(
	'/',
	validate({
		body: notificationPushRequestSchema,
		handler: handleValidationErrors,
	}),
	(req, res) => {
		// `validate` guarantees a well-formed, business-valid body here; anything
		// that fails schema/refinement is rejected by the middleware before us.
		const body = req.body;

		// Without a persistence layer yet, we mint the id in-process. Once a store
		// exists this becomes the primary key the channel adapters update.
		const notificationId = randomUUID();
		const statusUrl = `/v1/notifications/${notificationId}/status`;

		const plans = body.channels.map((plan) => ({
			channel: plan.channel,
			planId: `${notificationId}#${plan.channel}`,
			status: 'accepted' as const,
		}));

		const expiresAt =
			Math.floor(Date.now() / 1000) + CANCELLATION_WINDOW_SECONDS;

		// 202 Accepted: the request is valid and enqueued for per-channel dispatch.
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
