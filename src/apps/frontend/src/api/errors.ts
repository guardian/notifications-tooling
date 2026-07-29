import { z } from 'zod';

/** A single entry in an `ApiError`'s `422 validation_failed`-shaped `details`. */
const apiErrorDetailSchema = z.object({
	code: z.string(),
	/** An RFC 6901 JSON Pointer, e.g. `/channels/newsletter/compose/subject`. */
	path: z.string(),
	message: z.string(),
});
export type ApiErrorDetail = z.infer<typeof apiErrorDetailSchema>;

/** The distinct ways a `fetchJsonAndParse` call can fail. */
export type ApiErrorFailure =
	| 'fetch-fail'
	| 'json-parse-fail'
	| 'schema-parse-fail'
	| 'non-2xx-response'
	| 'timeout'
	| 'unauthenticated'
	/**
	 * Authenticated, but the signed-in user lacks the permission the route
	 * requires. Distinct from `unauthenticated` because signing in again cannot
	 * fix it, so it must never trigger a login redirect.
	 */
	| 'forbidden';

interface ApiErrorParams {
	message: string;
	failure: ApiErrorFailure;
	status?: number;
	details?: ApiErrorDetail[];
	requestId?: string;
	cause?: unknown;
}

/**
 * The single typed error thrown by the API client. Callers can branch on
 * `failure` (and `status`) without parsing message strings.
 */
export class ApiError extends Error {
	readonly failure: ApiErrorFailure;
	readonly status?: number;
	/**
	 * Per-field problems from a `400`/`422`. Logged rather than rendered: with
	 * the backend validating against the validation cap rather than the
	 * editorial limit, reaching one of these means a client bug, not something
	 * an editor can fix by rewording a field.
	 */
	readonly details?: ApiErrorDetail[];
	/** Correlates a user-visible failure with the backend logs. */
	readonly requestId?: string;

	constructor({
		message,
		failure,
		status,
		details,
		requestId,
		cause,
	}: ApiErrorParams) {
		super(message, { cause });
		this.name = 'ApiError';
		this.failure = failure;
		this.status = status;
		this.details = details;
		this.requestId = requestId;
	}
}

/**
 * The error envelope every non-2xx backend response carries. Permissive by
 * design — a failure must stay legible even if the body is a proxy's HTML or an
 * older shape, so every field beyond `error` is optional.
 */
export const apiErrorEnvelopeSchema = z.object({
	error: z.string(),
	message: z.string().optional(),
	requestId: z.string().optional(),
	loginUrl: z.string().optional(),
	details: z.array(apiErrorDetailSchema).optional(),
});
