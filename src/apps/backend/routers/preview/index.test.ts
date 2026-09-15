import { afterAll, beforeAll, describe, expect, it, mock } from 'bun:test';
import { newsletterSegments } from '@config';
import { UserPermissions } from '@models';
import express from 'express';
import {
	authenticateRequests,
	installPandaAuthMock,
} from '../../utils/test-utils/panda-auth';
import {
	grantPermissions,
	installPermissionsStoreMock,
} from '../../utils/test-utils/permissions';
import type { TestServer } from '../../utils/test-utils/server';
import { buildEmailPreviewRenderRequest, createPreviewRouter } from '.';

installPandaAuthMock();
installPermissionsStoreMock();

const { startTestServer } = await import('../../utils/test-utils/server');
const fetchEmail = mock(() => Promise.resolve('<html>Preview</html>'));

let server: TestServer;

beforeAll(async () => {
	authenticateRequests();
	grantPermissions([UserPermissions.DispatchAccess]);
	server = await startTestServer(
		express()
			.use(express.json())
			.use('/v1/preview', createPreviewRouter(fetchEmail)),
	);
});

afterAll(async () => {
	await server.close();
});

describe('POST /v1/preview/email', () => {
	it('builds an email-rendering request with a liveblog block id', () => {
		const blockId = '6a9af4938f0834a1091dfae4';
		const article =
			`https://www.theguardian.com/world/live/2026/sep/04/latest-developments` +
			`?page=with%3Ablock-${blockId}#block-${blockId}`;

		expect(
			buildEmailPreviewRenderRequest(
				article,
				newsletterSegments.UK,
				'https://email-rendering.example.com',
			),
		).toEqual({
			endpoint: 'https://email-rendering.example.com',
			articleUrl: article,
			blockId,
			newsletterId: newsletterSegments.UK.emailRenderingNewsletterId,
			hideKicker: true,
			timeoutMs: 10_000,
			previewText: ' ',
		});
	});

	it('preserves a liveblog block URL and returns the preview contract', async () => {
		const blockId = '6a9af4938f0834a1091dfae4';
		const article =
			`https://www.theguardian.com/world/live/2026/sep/04/latest-developments` +
			`?page=with%3Ablock-${blockId}#block-${blockId}`;

		const response = await fetch(`${server.baseUrl}/v1/preview/email`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ article, audience: ['UK'] }),
		});

		expect(fetchEmail).toHaveBeenCalledWith(article, newsletterSegments.UK);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			articleId: 'world/live/2026/sep/04/latest-developments',
			html: '<html>Preview</html>',
			newsletterId: newsletterSegments.UK.emailRenderingNewsletterId,
		});
	});
});
