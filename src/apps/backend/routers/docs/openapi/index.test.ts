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
			'id',
			'webUrl',
			'publishedAt',
			'headline',
			'section',
			'intendedAudience',
		]);
	});
});

describe('notification history OpenAPI contract', () => {
	it('documents repeated channel filters', () => {
		const parameter = openApiDocument.paths[
			'/v1/notifications'
		].get.parameters.find(({ name }) => name === 'channel');
		expect(parameter).toMatchObject({
			in: 'query',
			required: false,
			style: 'form',
			explode: true,
			schema: {
				type: 'array',
				items: { type: 'string', enum: ['newsletter', 'app-push'] },
			},
		});
	});

	it('documents article history lookup and its compact send response', () => {
		const articleHistory =
			openApiDocument.paths['/v1/notifications/article'].get;
		const articleIdParameter = articleHistory.parameters.find(
			({ name }) => name === 'articleId',
		);
		const responseSchema =
			articleHistory.responses['200'].content['application/json'].schema;

		expect(articleIdParameter).toMatchObject({
			in: 'query',
			required: true,
			schema: { type: 'string', maxLength: 2048 },
		});
		expect(responseSchema).toEqual({
			$ref: '#/components/schemas/NotificationArticleHistory',
		});
		expect(
			openApiDocument.components.schemas.NotificationArticleHistory.required,
		).toEqual(['articleId', 'total', 'limit', 'offset', 'sends']);
		expect(
			openApiDocument.components.schemas.NotificationArticleHistory.properties
				.sends.items.$ref,
		).toBe('#/components/schemas/NotificationArticleHistorySend');
		expect(
			openApiDocument.components.schemas.NotificationArticleHistorySend
				.properties.channels.items.$ref,
		).toBe('#/components/schemas/NotificationChannel');
	});

	it('documents repeated categories using the validation enum', () => {
		const parameter = openApiDocument.paths[
			'/v1/notifications'
		].get.parameters.find(({ name }) => name === 'alertType');
		expect(parameter).toMatchObject({
			in: 'query',
			required: false,
			style: 'form',
			explode: true,
			schema: { $ref: '#/components/schemas/HistoryAlertTypes' },
		});
		expect(openApiDocument.components.schemas.HistoryAlertTypes).toMatchObject({
			type: 'array',
			items: {
				type: 'string',
				enum: [
					'none',
					'breaking-news',
					'exclusive',
					'editors-picks',
					'one-not-to-miss',
					'sport',
				],
			},
		});
	});
	it('documents the bounded search query parameter', () => {
		const searchParameter = openApiDocument.paths[
			'/v1/notifications'
		].get.parameters.find(({ name }) => name === 'search');

		expect(searchParameter).toMatchObject({
			in: 'query',
			required: false,
			schema: { type: 'string', minLength: 1, maxLength: 200 },
		});
	});
});
