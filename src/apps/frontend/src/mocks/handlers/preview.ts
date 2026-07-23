import { http, HttpResponse } from 'msw';
import { getApiBaseUrl } from '../../api/config';
import type { PreviewResponse } from '../../features/stand-frontend/api/schemas';

const CANNED_PREVIEW_HTML = `
	<div style="font-family: sans-serif; padding: 16px;">
		<p style="text-transform: uppercase; color: #c70000; font-weight: bold;">Breaking News</p>
		<h1>Mocked email preview</h1>
		<p>This HTML is a canned MSW fixture — the real render
		pipeline (CAPI resolve + shared email template) is part of the backend
		proposal.</p>
	</div>
`;

/**
 * Canned `{ html }` response for `HtmlPreviewLoader.fetchHtml`. Always
 * labelled as mocked — the real render pipeline is deferred
 * to the backend proposal.
 */
export const previewSuccessHandler = http.post(
	`${getApiBaseUrl()}/v1/preview`,
	() => {
		const response: PreviewResponse = { html: CANNED_PREVIEW_HTML };
		return HttpResponse.json(response);
	},
);

export const previewHandlers = [previewSuccessHandler];
