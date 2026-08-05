import { describe, expect, it, mock } from 'bun:test';
import { BrazeApiError, EmailRenderingError } from '@services';
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
	it('returns a safe validation error when email rendering cannot find an article', () => {
		const { response, status, json } = createResponse();

		errorMiddleware(
			new EmailRenderingError(404),
			request,
			response,
			mock(() => undefined),
		);

		expect(status).toHaveBeenCalledWith(422);
		expect(json).toHaveBeenCalledWith({
			error: 'email_rendering_failed',
			message: 'The article could not be found by email rendering.',
		});
	});

	it('returns a safe upstream error when email rendering fails', () => {
		const { response, status, json } = createResponse();

		errorMiddleware(
			new EmailRenderingError(500),
			request,
			response,
			mock(() => undefined),
		);

		expect(status).toHaveBeenCalledWith(502);
		expect(json).toHaveBeenCalledWith({
			error: 'email_rendering_failed',
			message: 'Email rendering is currently unavailable.',
		});
	});

	it('returns a gateway timeout when email rendering times out', () => {
		const { response, status, json } = createResponse();

		errorMiddleware(
			new EmailRenderingError(undefined, 'timeout'),
			request,
			response,
			mock(() => undefined),
		);

		expect(status).toHaveBeenCalledWith(504);
		expect(json).toHaveBeenCalledWith({
			error: 'email_rendering_failed',
			message: 'Email rendering is currently unavailable.',
		});
	});

	it('returns a safe upstream error when Braze rejects a request', () => {
		const { response, status, json } = createResponse();

		errorMiddleware(
			new BrazeApiError('test email send', 'http_error', 503),
			request,
			response,
			mock(() => undefined),
		);

		expect(status).toHaveBeenCalledWith(502);
		expect(json).toHaveBeenCalledWith({
			error: 'braze_request_failed',
			message: 'Braze could not complete the request.',
		});
	});

	it('returns a gateway timeout when Braze times out', () => {
		const { response, status, json } = createResponse();

		errorMiddleware(
			new BrazeApiError('campaign trigger', 'timeout'),
			request,
			response,
			mock(() => undefined),
		);

		expect(status).toHaveBeenCalledWith(504);
		expect(json).toHaveBeenCalledWith({
			error: 'braze_request_failed',
			message: 'Braze could not complete the request.',
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
		expect(json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
	});
});
