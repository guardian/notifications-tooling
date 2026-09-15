import { describe, expect, it, mock } from 'bun:test';
import { DuplicateIdempotencyKeyError } from '@database';
import type { Request, Response } from 'express';
import { errorMiddleware } from './error-middleware';

const createResponse = () => {
	const json = mock(() => undefined);
	const status = mock(() => ({ json }));

	return { response: { status } as unknown as Response, status, json };
};

const request = {
	log: { error: mock(() => undefined) },
} as unknown as Request;

describe('errorMiddleware', () => {
	it('returns a conflict when the idempotency key was already used', () => {
		const { response, status, json } = createResponse();

		errorMiddleware(
			new DuplicateIdempotencyKeyError('morning-briefing-2026-07-08'),
			request,
			response,
			mock(() => undefined),
		);

		expect(status).toHaveBeenCalledWith(409);
		expect(json).toHaveBeenCalledWith({
			error: 'idempotency_key_conflict',
			message:
				"idempotencyKey 'morning-briefing-2026-07-08' has already been used.",
			requestId: undefined,
		});
	});

	it('keeps unexpected failures internal', () => {
		const { response, status, json } = createResponse();

		errorMiddleware(
			new Error('Unexpected failure'),
			request,
			response,
			mock(() => undefined),
		);

		expect(status).toHaveBeenCalledWith(500);
		expect(json).toHaveBeenCalledWith({
			error: 'internal_error',
			message: 'The request could not be completed.',
			requestId: undefined,
		});
	});
});
