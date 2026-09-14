import { z } from 'zod';

const renderedNotificationSchema = z.object({
	body: z.string().min(1),
});

type RenderEmailRequest = {
	endpoint: string;
	articleUrl: string;
	newsletterId: string;
	headlineOverride?: string;
	previewText?: string;
	hideKicker?: boolean;
	timeoutMs: number;
};

export type EmailRenderingFailureReason =
	'http_error' | 'timeout' | 'network_error' | 'invalid_response';

export class EmailRenderingError extends Error {
	constructor(
		readonly status?: number,
		readonly reason: EmailRenderingFailureReason = 'http_error',
		options?: ErrorOptions,
	) {
		const message = (() => {
			switch (reason) {
				case 'http_error':
					return status === undefined
						? 'Email rendering failed.'
						: `Email rendering failed with status ${status}.`;
				case 'timeout':
					return 'Email rendering timed out.';
				case 'network_error':
					return 'Email rendering failed.';
				case 'invalid_response':
					return 'Email rendering returned an invalid response.';
			}
		})();

		super(message, options);
		this.name = 'EmailRenderingError';
	}
}

const isTimeoutError = (error: unknown): boolean =>
	error instanceof Error &&
	(error.name === 'AbortError' || error.name === 'TimeoutError');

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
	headlineOverride,
	previewText,
	hideKicker,
	timeoutMs,
}: RenderEmailRequest): Promise<string> => {
	const articleId = articleIdFromUrl(articleUrl)
		.split('/')
		.map(encodeURIComponent)
		.join('/');
	const renderUrl = new URL(`/notification/${articleId}.json`, endpoint);

	console.log('renderEmail: requesting', {
		renderUrl: renderUrl.toString(),
		newsletterId,
		headlineOverride,
		previewText,
		hideKicker,
	});

	let response: Response;
	try {
		response = await fetch(renderUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				newsletterId,
				headlineOverride,
				previewText,
				hideKicker,
			}),
			signal: AbortSignal.timeout(timeoutMs),
		});
	} catch (error) {
		console.log('renderEmail: request failed', error);
		throw new EmailRenderingError(
			undefined,
			isTimeoutError(error) ? 'timeout' : 'network_error',
			{ cause: error },
		);
	}

	console.log('renderEmail: response received', { status: response.status });

	if (!response.ok) {
		throw new EmailRenderingError(response.status);
	}

	try {
		const html = renderedNotificationSchema.parse(await response.json()).body;
		console.log('renderEmail: parsed html', { length: html.length });
		return html;
	} catch (error) {
		throw new EmailRenderingError(response.status, 'invalid_response', {
			cause: error,
		});
	}
};
