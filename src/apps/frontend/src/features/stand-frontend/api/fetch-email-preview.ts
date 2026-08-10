import { type EmailPreviewRequest, emailPreviewResponseSchema } from '@models';
import { fetchJsonAndParse } from '../../../api/client';
import type { RequestEmailHtml } from '../types';

export const requestEmailHtml: RequestEmailHtml = async (
	articleId,
	options,
) => {
	const payload: EmailPreviewRequest = {
		article: `https://www.theguardian.com/${articleId}`,
		audience: options.audience.split(','),
	};

	const data = await fetchJsonAndParse(
		emailPreviewResponseSchema,
		'/v1/preview/email',
		{
			method: 'POST',
			body: JSON.stringify(payload),
			headers: { 'Content-Type': 'application/json' },
		},
	);

	return data.html;
};
