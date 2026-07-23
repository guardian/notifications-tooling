import type { z } from 'zod';
import { getApiBaseUrl } from './config';
import { ApiError } from './errors';

const DEFAULT_TIMEOUT_MS = 10_000;

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
		throw new ApiError({
			message: `Request to ${path} responded with ${response.status}`,
			failure: 'non-2xx-response',
			status: response.status,
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
		// Loud early warning of backend contract drift (see Decision 10 in the plan).
		console.error(`Schema parse failed for ${path}:`, result.error);
		throw new ApiError({
			message: `Response from ${path} did not match the expected schema`,
			failure: 'schema-parse-fail',
			status: response.status,
			cause: result.error,
		});
	}

	return result.data;
}
