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

describe('notification history OpenAPI contract', () => {
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
