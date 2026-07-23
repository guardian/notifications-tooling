/** A single entry in an `ApiError`'s `422 validation_failed`-shaped `details`. */
export interface ApiErrorDetail {
	code: string;
	path: Array<string | number>;
	message: string;
	meta?: Record<string, unknown>;
}

/** The distinct ways a `fetchJsonAndParse` call can fail. */
export type ApiErrorFailure =
	| 'fetch-fail'
	| 'json-parse-fail'
	| 'schema-parse-fail'
	| 'non-2xx-response'
	| 'timeout';

interface ApiErrorParams {
	message: string;
	failure: ApiErrorFailure;
	status?: number;
	details?: ApiErrorDetail[];
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
	 * Mirrors the notification-sending-model-proposal's `422` error shape.
	 * Left unpopulated until the backend implements per-field validation.
	 */
	readonly details?: ApiErrorDetail[];

	constructor({ message, failure, status, details, cause }: ApiErrorParams) {
		super(message, { cause });
		this.name = 'ApiError';
		this.failure = failure;
		this.status = status;
		this.details = details;
	}
}
