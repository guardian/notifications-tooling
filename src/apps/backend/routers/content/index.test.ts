import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { UserPermissions } from '@config';
import express from 'express';
import {
	assertUnauthenticatedRequestBlocked,
	authenticateRequests,
	installPandaAuthMock,
} from '../../utils/test-utils/panda-auth';
import {
	assertInsufficientPermissionsRequestBlocked,
	grantPermissions,
	installPermissionsStoreMock,
} from '../../utils/test-utils/permissions';
import type { TestServer } from '../../utils/test-utils/server';
import { CapiError } from './capi-client';
import { createContentRouter } from '.';

// Stub Panda verification and the permissions store before the app (and its
// real clients) are imported.
installPandaAuthMock();
installPermissionsStoreMock();
const { startTestServer } = await import('../../utils/test-utils/server');

/**
 * Drives the real Express app over HTTP so the full `POST /v1/content/link/parse`
 * chain runs: `express.json()` -> auth -> permissions -> the `express-zod-safe`
 * `validate` middleware -> the handler. The CAPI resolver is only exercised via
 * the injected mock in the dedicated app below, so no network call is made.
 */

let server: TestServer;
let baseUrl: string;

const articleSummary = {
	articleId: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
	category: 'Environment',
	publishedAt: '2026-07-19T15:37:18Z',
	thumbnailUrl: 'https://media.guim.co.uk/abc/500.jpg',
};

const validUrl =
	'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures';

beforeAll(async () => {
	authenticateRequests();
	grantPermissions([UserPermissions.DispatchAccess]);
	// The default router resolves an article that is always found, so the
	// auth/permission/validation cases below never hit the network.
	const resolveArticle = mock(() => Promise.resolve(articleSummary));
	server = await startTestServer(
		express()
			.use(express.json())
			.use('/v1/content', createContentRouter(resolveArticle)),
	);
	baseUrl = server.baseUrl;
});

afterAll(async () => {
	await server.close();
});

const parseLink = (body: unknown): Promise<Response> =>
	fetch(`${baseUrl}/v1/content/link/parse`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});

/** Spins up the content router with an injected resolver for a single test. */
const withResolver = async (
	resolveArticle: (articleId: string) => Promise<typeof articleSummary>,
	run: (baseUrl: string) => Promise<void>,
): Promise<void> => {
	const testServer = await startTestServer(
		express()
			.use(express.json())
			.use('/v1/content', createContentRouter(resolveArticle)),
	);
	try {
		await run(testServer.baseUrl);
	} finally {
		await testServer.close();
	}
};

describe('POST /v1/content/link/parse', () => {
	describe('authentication', () => {
		it('blocks unauthenticated requests', async () => {
			await assertUnauthenticatedRequestBlocked(baseUrl, {
				method: 'POST',
				path: '/v1/content/link/parse',
			});
		});
	});

	describe('permissions', () => {
		it('blocks requests without the dispatch permission', async () => {
			await assertInsufficientPermissionsRequestBlocked(baseUrl, {
				method: 'POST',
				path: '/v1/content/link/parse',
				body: { link: { url: validUrl } },
			});
		});
	});

	describe('happy path', () => {
		it('resolves the article via CAPI and returns 200 with the summary', async () => {
			const resolveArticle = mock(() => Promise.resolve(articleSummary));

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}/v1/content/link/parse`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ link: { url: validUrl } }),
				});

				expect(response.status).toBe(200);
				expect(await response.json()).toEqual(articleSummary);
				expect(resolveArticle).toHaveBeenCalledWith(
					'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
				);
			});
		});
	});

	describe('invalid_url', () => {
		it('rejects a non-Guardian URL with 422 without calling CAPI', async () => {
			const resolveArticle = mock(() => Promise.resolve(articleSummary));

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}/v1/content/link/parse`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						link: { url: 'https://evil.example.com/story' },
					}),
				});

				expect(response.status).toBe(422);
				expect(((await response.json()) as { error: string }).error).toBe(
					'invalid_url',
				);
				expect(resolveArticle).not.toHaveBeenCalled();
			});
		});

		it('rejects a Guardian URL that is not an article with 422', async () => {
			const response = await parseLink({
				link: { url: 'https://www.theguardian.com/uk' },
			});

			expect(response.status).toBe(422);
			expect(((await response.json()) as { error: string }).error).toBe(
				'invalid_url',
			);
		});
	});

	describe('article_not_found', () => {
		it('returns 404 when CAPI cannot find the article', async () => {
			const resolveArticle = mock(() =>
				Promise.reject(new CapiError('not_found')),
			);

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}/v1/content/link/parse`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ link: { url: validUrl } }),
				});

				expect(response.status).toBe(404);
				expect(((await response.json()) as { error: string }).error).toBe(
					'article_not_found',
				);
			});
		});
	});

	describe('capi_unavailable', () => {
		it('returns 502 when CAPI cannot be reached', async () => {
			const resolveArticle = mock(() =>
				Promise.reject(new CapiError('unavailable')),
			);

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}/v1/content/link/parse`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ link: { url: validUrl } }),
				});

				expect(response.status).toBe(502);
				expect(((await response.json()) as { error: string }).error).toBe(
					'capi_unavailable',
				);
			});
		});
	});

	describe('invalid payload', () => {
		it('rejects a body missing the link object', async () => {
			const response = await parseLink({});

			expect(response.status).toBe(400);
			expect(((await response.json()) as { error: string }).error).toBe(
				'bad_request',
			);
		});

		it('rejects unknown keys in the payload', async () => {
			const response = await parseLink({
				link: { url: validUrl },
				extra: true,
			});

			expect(response.status).toBe(400);
			expect(((await response.json()) as { error: string }).error).toBe(
				'bad_request',
			);
		});
	});
});
