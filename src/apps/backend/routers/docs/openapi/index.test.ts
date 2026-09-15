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
