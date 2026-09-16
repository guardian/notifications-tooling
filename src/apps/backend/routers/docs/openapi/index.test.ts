import { describe, expect, it } from 'bun:test';
import { openApiDocument } from '.';

describe('email preview OpenAPI contract', () => {
	it('references request and response schemas derived from the API contract', () => {
		const previewPath = openApiDocument.paths['/v1/preview/email'].post;

		expect(
			previewPath.requestBody.content['application/json'].schema.$ref,
		).toBe('#/components/schemas/EmailPreviewRequest');
		expect(
			previewPath.responses['200'].content['application/json'].schema.$ref,
		).toBe('#/components/schemas/EmailPreviewResponse');

		expect(
			openApiDocument.components.schemas.EmailPreviewRequest.required,
		).toEqual(['article', 'audience']);
		expect(
			openApiDocument.components.schemas.EmailPreviewResponse.required,
		).toEqual(['articleId', 'html', 'newsletterId']);
	});
});

describe('latest articles OpenAPI contract', () => {
	it('registers the route with its generated response schema', () => {
		const latestArticlesPath =
			openApiDocument.paths['/v1/content/articles/latest'].get;

		expect(
			latestArticlesPath.responses['200'].content['application/json'].schema
				.$ref,
		).toBe('#/components/schemas/LatestArticlesResponse');
		expect(
			latestArticlesPath.responses['502'].content['application/json'].schema
				.$ref,
		).toBe('#/components/schemas/CapiUnavailableError');
		expect(
			openApiDocument.components.schemas.LatestArticlesResponse,
		).toMatchObject({
			properties: {
				articles: {
					items: { $ref: '#/components/schemas/LatestArticle' },
				},
			},
		});
		expect(openApiDocument.components.schemas.LatestArticle.required).toEqual([
			'webUrl',
			'publishedAt',
			'headline',
			'section',
			'intendedAudience',
		]);
	});
});
