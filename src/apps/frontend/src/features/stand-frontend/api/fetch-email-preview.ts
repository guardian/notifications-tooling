import { emailPreviewResponseSchema } from '@models';
import { fetchJsonAndParse } from '../../../api/client';
import type { RequestEmailHtml } from '../types';

export const requestEmailHtml: RequestEmailHtml = async (request) => {
	const data = await fetchJsonAndParse(
		emailPreviewResponseSchema,
		'/v1/preview/email',
		{
			method: 'POST',
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
		},
	);

	return data;
};
