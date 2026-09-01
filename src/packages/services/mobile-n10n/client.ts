import { z } from 'zod';

/** mobile-n10n rejects a push targeting more than this many topics. */
export const MAX_APP_NOTIFICATION_TOPICS = 20;

/** mobile-n10n's `importance` values (`BreakingNewsPayload.importance`). */
export type AppNotificationImportance = 'Major' | 'Minor';

export type SendAppNotificationRequest = {
	endpoint: string;
	apiKey: string;
	timeoutMs: number;
	/** Supplied for traceability; a UUID is generated when omitted. */
	id?: string;
	sender: string;
	title: string;
	body: string;
	/** Canonical Guardian article URL the notification opens. */
	link: string;
	/**
	 * CAPI content id derived from `link`. When set, the notification carries a
	 * Guardian link so the apps deep-link in place; otherwise `link` is sent as an
	 * external URL.
	 */
	contentApiId?: string;
	importance: AppNotificationImportance;
	topics: ReadonlyArray<{ type: string; name: string }>;
	media?: {
		type: 'image';
		imageUrl: string;
		thumbnailUrl?: string;
	};
	dryRun?: boolean;
};

/** mobile-n10n's `POST /push/topic` success (`PushResult`) plus its HTTP status. */
export type AppNotificationResult = { id: string; status: number };

export type AppNotificationFailureReason =
	'http_error' | 'timeout' | 'network_error' | 'invalid_response';

export class AppNotificationApiError extends Error {
	constructor(
		readonly reason: AppNotificationFailureReason,
		readonly status?: number,
		options?: ErrorOptions,
	) {
		const message = (() => {
			switch (reason) {
				case 'http_error':
					return status === undefined
						? 'App notification push failed.'
						: `App notification push failed with status ${status}.`;
				case 'timeout':
					return 'App notification push timed out.';
				case 'network_error':
					return 'App notification push failed.';
				case 'invalid_response':
					return 'App notification push returned an invalid response.';
			}
		})();

		super(message, options);
		this.name = 'AppNotificationApiError';
	}
}

const pushResultSchema = z.object({ id: z.string() });

const isTimeoutError = (error: unknown): boolean =>
	error instanceof Error &&
	(error.name === 'AbortError' || error.name === 'TimeoutError');

/**
 * Pushes a breaking-news notification to mobile-n10n's `POST /push/topic`, which
 * fans it out to every device subscribed to the given topics. The Guardian
 * article `link` is sent as an external link so the apps open it in place.
 * Throws an {@link AppNotificationApiError} classifying any failure.
 */
export const sendAppNotification = async ({
	endpoint,
	apiKey,
	timeoutMs,
	id,
	sender,
	title,
	body,
	link,
	contentApiId,
	importance,
	topics,
	media,
	dryRun = false,
}: SendAppNotificationRequest): Promise<AppNotificationResult> => {
	if (topics.length < 1) {
		throw new RangeError(
			'An app notification push must target at least one topic.',
		);
	}
	if (topics.length > MAX_APP_NOTIFICATION_TOPICS) {
		throw new RangeError(
			`An app notification push may target at most ${MAX_APP_NOTIFICATION_TOPICS} topics (received ${topics.length}).`,
		);
	}

	const thumbnailUrl = media?.thumbnailUrl ?? media?.imageUrl;

	const payload = {
		id: id ?? crypto.randomUUID(),
		type: 'news',
		title,
		message: body,
		sender,
		// A Guardian link (contentApiId + `item-trimmed` GITContent prefix) so the
		// apps open the article in place; an external URL when no id is derivable.
		// `link.title` mirrors the message (the headline), as Fronts does.
		link: contentApiId
			? {
					contentApiId,
					title: body,
					git: { mobileAggregatorPrefix: 'item-trimmed' },
				}
			: { url: link },
		importance,
		topic: topics.map(({ type, name }) => ({ type, name })),
		debug: false,
		dryRun,
		// Always send media as `thumbnailUrl`, never `imageUrl`. On Android, an
		// `imageUrl` routes the push into a big-picture notification path that builds
		// the notification before attaching the tap intent, so it arrives without a
		// click action and the article can't be opened; `thumbnailUrl` uses the path
		// that attaches the intent. Prefer the thumbnail crop, falling back to the
		// lead image, and send nothing when neither is supplied.
		...(thumbnailUrl ? { thumbnailUrl } : {}),
	};

	const url = new URL('/push/topic', endpoint).toString();

	let response: Response;
	try {
		response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json; charset=utf-8',
			},
			body: JSON.stringify(payload),
			signal: AbortSignal.timeout(timeoutMs),
		});
	} catch (error) {
		throw new AppNotificationApiError(
			isTimeoutError(error) ? 'timeout' : 'network_error',
			undefined,
			{ cause: error },
		);
	}

	if (!response.ok) {
		throw new AppNotificationApiError('http_error', response.status);
	}

	try {
		const result = pushResultSchema.parse(await response.json());
		return { ...result, status: response.status };
	} catch (error) {
		throw new AppNotificationApiError('invalid_response', response.status, {
			cause: error,
		});
	}
};
