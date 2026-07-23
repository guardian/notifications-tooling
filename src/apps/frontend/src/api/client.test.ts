import { describe, expect, it } from 'bun:test';
import { http, HttpResponse } from 'msw';
import { z } from 'zod';
import { server } from '../mocks/server';
import { fetchJsonAndParse } from './client';
import { getApiBaseUrl } from './config';
import { ApiError } from './errors';

const echoSchema = z.object({ message: z.string() });

describe('fetchJsonAndParse', () => {
	it('targets the current frontend origin', () => {
		expect(getApiBaseUrl()).toBe('http://localhost:3000');
	});

	it('parses a 2xx JSON response against the schema', async () => {
		server.use(
			http.get(`${getApiBaseUrl()}/echo`, () =>
				HttpResponse.json({ message: 'hello' }),
			),
		);

		const result = await fetchJsonAndParse(echoSchema, '/echo');

		expect(result).toEqual({ message: 'hello' });
	});

	it('throws a non-2xx-response ApiError with the response status', () => {
		server.use(
			http.get(`${getApiBaseUrl()}/echo`, () =>
				HttpResponse.json({ error: 'nope' }, { status: 503 }),
			),
		);

		expect(fetchJsonAndParse(echoSchema, '/echo')).rejects.toMatchObject({
			failure: 'non-2xx-response',
			status: 503,
		});
	});

	it('throws a schema-parse-fail ApiError when the body does not match the schema', () => {
		server.use(
			http.get(`${getApiBaseUrl()}/echo`, () =>
				HttpResponse.json({ unexpected: true }),
			),
		);

		expect(fetchJsonAndParse(echoSchema, '/echo')).rejects.toMatchObject({
			failure: 'schema-parse-fail',
		});
	});

	it('throws a json-parse-fail ApiError when the body is not JSON', () => {
		server.use(
			http.get(
				`${getApiBaseUrl()}/echo`,
				() => new HttpResponse('not json', { status: 200 }),
			),
		);

		expect(fetchJsonAndParse(echoSchema, '/echo')).rejects.toMatchObject({
			failure: 'json-parse-fail',
		});
	});

	it('throws a fetch-fail ApiError when the network request errors', () => {
		server.use(http.get(`${getApiBaseUrl()}/echo`, () => HttpResponse.error()));

		expect(fetchJsonAndParse(echoSchema, '/echo')).rejects.toMatchObject({
			failure: 'fetch-fail',
		});
	});

	it('throws an ApiError instance so callers can branch on `failure`', async () => {
		server.use(
			http.get(`${getApiBaseUrl()}/echo`, () =>
				HttpResponse.json({}, { status: 500 }),
			),
		);

		try {
			await fetchJsonAndParse(echoSchema, '/echo');
			throw new Error('expected fetchJsonAndParse to throw');
		} catch (error) {
			expect(error).toBeInstanceOf(ApiError);
		}
	});
});
