import { z } from 'zod';
import { getApiBaseUrl } from './config';
import { ApiError, apiErrorEnvelopeSchema } from './errors';

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Reads the shared error envelope off a non-2xx response, or `undefined` if the
 * body is missing, unparseable, or some other shape. A failure to understand
 * the error body must never mask the underlying failure.
 */
const readErrorEnvelope = async (response: Response) => {
	try {
		const parsed = apiErrorEnvelopeSchema.safeParse(await response.json());
		return parsed.success ? parsed.data : undefined;
	} catch {
		return undefined;
	}
};

interface FetchJsonAndParseInit extends RequestInit {
	/** Overrides the default 10s timeout. Ignored if `signal` is also passed. */
	timeoutMs?: number;
}

/**
 * The single fetch + Zod parse choke point for the frontend. Throws a typed
 * `ApiError` on any failure (network, non-2xx, bad JSON, or schema
 * mismatch) instead of returning a `Result`, since every current caller
 * (TanStack Query mutations/queries) is throw-based.
 */

export async function fetchJsonAndParse<Schema extends z.ZodType>(
	schema: Schema,
	path: string,
	init: FetchJsonAndParseInit = {},
): Promise<z.infer<Schema>> {
	const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...requestInit } = init;
	const url = `${getApiBaseUrl()}${path}`;

	let response: Response;
	try {
		response = await fetch(url, {
			...requestInit,
			signal: signal ?? AbortSignal.timeout(timeoutMs),
		});
	} catch (cause) {
		if (cause instanceof DOMException && cause.name === 'TimeoutError') {
			throw new ApiError({
				message: `Request to ${path} timed out after ${timeoutMs}ms`,
				failure: 'timeout',
				cause,
			});
		}
		throw new ApiError({
			message: `Network request to ${path} failed`,
			failure: 'fetch-fail',
			cause,
		});
	}

	if (!response.ok) {
		const envelope = await readErrorEnvelope(response);

		if (response.status === 401) {
			// Deliberately does not redirect. Navigating away from inside the
			// shared fetch helper would silently discard whatever the user was
			// doing, and a future caller (the send) would inherit that without
			// asking for it. The login URL is carried on the error instead, so
			// each call site decides. See docs/ADRs/login-redirect-ownership.md.
			throw new ApiError({
				message:
					envelope?.message ?? `Request to ${path} was not authenticated`,
				failure: 'unauthenticated',
				status: response.status,
				requestId: envelope?.requestId,
				loginUrl: envelope?.loginUrl,
			});
		}

		if (response.status === 403) {
			// Authenticated but not permitted. Deliberately not a login redirect:
			// the cookie is valid, so bouncing through login would loop.
			throw new ApiError({
				message:
					envelope?.message ??
					`Request to ${path} was not permitted for this user`,
				failure: 'forbidden',
				status: response.status,
				requestId: envelope?.requestId,
			});
		}

		if (envelope?.details?.length) {
			// Per-field problems are diagnostic, not user-facing: the backend
			// validates against the validation cap rather than the editorial
			// limit, so reaching one means a client bug. Logged loudly here so
			// it is visible without building a per-field rendering layer.
			console.error(`Validation details for ${path}:`, envelope.details);
		}

		throw new ApiError({
			message:
				envelope?.message ??
				`Request to ${path} responded with ${response.status}`,
			failure: 'non-2xx-response',
			status: response.status,
			details: envelope?.details,
			requestId: envelope?.requestId,
		});
	}

	let json: unknown;
	try {
		json = await response.json();
	} catch (cause) {
		throw new ApiError({
			message: `Response from ${path} was not valid JSON`,
			failure: 'json-parse-fail',
			status: response.status,
			cause,
		});
	}

	const result = schema.safeParse(json);
	if (!result.success) {
		const prettyError = z.prettifyError(result.error);
		// Loud early warning of backend contract drift.
		console.error(`Schema parse failed for ${path}:`, prettyError);
		throw new ApiError({
			message: `Response from ${path} did not match the expected schema`,
			failure: 'schema-parse-fail',
			status: response.status,
			cause: prettyError,
		});
	}

	return result.data;
}
