import { DuplicateIdempotencyKeyError } from '@database';
import type { ErrorRequestHandler } from 'express';
import { buildErrorEnvelope } from '../error-envelope';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express detects error middleware by its 4-arg signature
export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
	req.log.error(err);

	if (err instanceof DuplicateIdempotencyKeyError) {
		res
			.status(409)
			.json(
				buildErrorEnvelope(
					req,
					'idempotency_key_conflict',
					`idempotencyKey '${err.idempotencyKey}' has already been used.`,
				),
			);
		return;
	}

	res
		.status(500)
		.json(
			buildErrorEnvelope(
				req,
				'internal_error',
				'The request could not be completed.',
			),
		);
};
