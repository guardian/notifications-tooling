import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { UserPermissions } from '@config';
import { CapiError } from '@services';
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
import { createContentRouter } from '.';

// Stub Panda verification and the permissions store before the app (and its
// real clients) are imported.
installPandaAuthMock();
installPermissionsStoreMock();
const { startTestServer } = await import('../../utils/test-utils/server');

/**
 * Drives the real Express app over HTTP so the full
 * `POST /v1/content/articles/resolve` chain runs: `express.json()` -> auth ->
 * permissions -> the `express-zod-safe` `validate` middleware -> the handler.
 * The CAPI resolver is only exercised via the injected mock, so no network call
 * is made.
 */

const ROUTE = '/v1/content/articles/resolve';

let server: TestServer;
let baseUrl: string;

const showFields = ['headline', 'thumbnail'];

const resolvedArticle = {
	articleId: 'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
	url: 'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
	fields: {
		headline: 'A rhyme to recall rising temperatures',
		thumbnail: 'https://media.guim.co.uk/abc/500.jpg',
	},
};

const validUrl =
	'https://www.theguardian.com/environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures';

beforeAll(async () => {
	authenticateRequests();
	grantPermissions([UserPermissions.DispatchAccess]);
	// The default router resolves an article that is always found, so the
	// auth/permission/validation cases below never hit the network.
	const resolveArticle = mock(() => Promise.resolve(resolvedArticle));
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

const resolveRequest = (body: unknown): Promise<Response> =>
	fetch(`${baseUrl}${ROUTE}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
	});

/** Spins up the content router with an injected resolver for a single test. */
const withResolver = async (
	resolveArticle: (
		articleId: string,
		showFields: string[],
	) => Promise<typeof resolvedArticle>,
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

describe('POST /v1/content/articles/resolve', () => {
	describe('authentication', () => {
		it('blocks unauthenticated requests', async () => {
			await assertUnauthenticatedRequestBlocked(baseUrl, {
				method: 'POST',
				path: ROUTE,
			});
		});
	});

	describe('permissions', () => {
		it('blocks requests without the dispatch permission', async () => {
			await assertInsufficientPermissionsRequestBlocked(baseUrl, {
				method: 'POST',
				path: ROUTE,
				body: { article: validUrl, showFields },
			});
		});
	});

	describe('happy path', () => {
		it('resolves an article URL via CAPI and returns 200 with { id, url, fields }', async () => {
			const resolveArticle = mock(() => Promise.resolve(resolvedArticle));

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}${ROUTE}`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ article: validUrl, showFields }),
				});

				expect(response.status).toBe(200);
				expect(await response.json()).toEqual({
					article: {
						id: resolvedArticle.articleId,
						url: resolvedArticle.url,
						fields: resolvedArticle.fields,
					},
				});
				expect(resolveArticle).toHaveBeenCalledWith(
					'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
					showFields,
				);
			});
		});

		it('accepts a bare article id and resolves it via CAPI', async () => {
			const resolveArticle = mock(() => Promise.resolve(resolvedArticle));

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}${ROUTE}`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						article:
							'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
						showFields,
					}),
				});

				expect(response.status).toBe(200);
				expect(resolveArticle).toHaveBeenCalledWith(
					'environment/2026/jul/19/a-rhyme-to-recall-rising-temperatures',
					showFields,
				);
			});
		});
	});

	describe('invalid_article_reference', () => {
		it('rejects a non-Guardian URL with 422 without calling CAPI', async () => {
			const resolveArticle = mock(() => Promise.resolve(resolvedArticle));

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}${ROUTE}`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({
						article: 'https://evil.example.com/story',
						showFields,
					}),
				});

				expect(response.status).toBe(422);
				expect(((await response.json()) as { error: string }).error).toBe(
					'invalid_article_reference',
				);
				expect(resolveArticle).not.toHaveBeenCalled();
			});
		});

		it('rejects a Guardian URL that is not an article with 422', async () => {
			const response = await resolveRequest({
				article: 'https://www.theguardian.com/uk',
				showFields,
			});

			expect(response.status).toBe(422);
			expect(((await response.json()) as { error: string }).error).toBe(
				'invalid_article_reference',
			);
		});
	});

	describe('article_not_found', () => {
		it('returns 404 when CAPI cannot find the article', async () => {
			const resolveArticle = mock(() =>
				Promise.reject(new CapiError('not_found')),
			);

			await withResolver(resolveArticle, async (url) => {
				const response = await fetch(`${url}${ROUTE}`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ article: validUrl, showFields }),
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
				const response = await fetch(`${url}${ROUTE}`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ article: validUrl, showFields }),
				});

				expect(response.status).toBe(502);
				expect(((await response.json()) as { error: string }).error).toBe(
					'capi_unavailable',
				);
			});
		});
	});

	describe('invalid payload', () => {
		it('rejects a body missing the article reference', async () => {
			const response = await resolveRequest({ showFields });

			expect(response.status).toBe(400);
			expect(((await response.json()) as { error: string }).error).toBe(
				'bad_request',
			);
		});

		it('rejects unknown keys in the payload', async () => {
			const response = await resolveRequest({
				article: validUrl,
				showFields,
				extra: true,
			});

			expect(response.status).toBe(400);
			expect(((await response.json()) as { error: string }).error).toBe(
				'bad_request',
			);
		});
	});
});
