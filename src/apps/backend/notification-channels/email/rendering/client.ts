import { z } from 'zod';

const renderedNotificationSchema = z.object({
	body: z.string().min(1),
});

type RenderEmailRequest = {
	endpoint: string;
	articleUrl: string;
	newsletterId: string;
	timeoutMs: number;
};

const articleIdFromUrl = (articleUrl: string): string => {
	const articleId = new URL(articleUrl).pathname.replace(/^\/+/, '');

	if (!articleId) {
		throw new Error('Cannot render a notification without an article ID.');
	}

	return articleId;
};

export const renderEmail = async ({
	endpoint,
	articleUrl,
	newsletterId,
	timeoutMs,
}: RenderEmailRequest): Promise<string> => {
	const articleId = articleIdFromUrl(articleUrl)
		.split('/')
		.map(encodeURIComponent)
		.join('/');
	const renderUrl = new URL(`/notification/${articleId}.json`, endpoint);
	renderUrl.searchParams.set('newsletter-id', newsletterId);

	const response = await fetch(renderUrl, {
		signal: AbortSignal.timeout(timeoutMs),
	});

	if (!response.ok) {
		throw new Error(`Email rendering failed with status ${response.status}.`);
	}

	return renderedNotificationSchema.parse(await response.json()).body;
};
