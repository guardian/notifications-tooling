import { afterEach, describe, expect, it, spyOn } from 'bun:test';
import {
	MAX_APP_NOTIFICATION_TOPICS,
	sendAppNotification,
	type SendAppNotificationRequest,
} from './client';

afterEach(() => {
	spyOn(globalThis, 'fetch').mockRestore();
});

const request: SendAppNotificationRequest = {
	endpoint: 'https://n10n.example.com',
	apiKey: 'secret-api-key',
	timeoutMs: 10_000,
	id: 'push-1',
	sender: 'notifications-tooling-spa/v1',
	title: 'Breaking news',
	body: 'World leaders gather in Geneva as talks open.',
	link: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
	importance: 'Major',
	topics: [
		{ type: 'breaking', name: 'uk' },
		{ type: 'breaking', name: 'us' },
	],
};

describe('sendAppNotification', () => {
	it('pushes a breaking-news payload to the topic endpoint', async () => {
		const timeoutSignal = new AbortController().signal;
		const timeout = spyOn(AbortSignal, 'timeout').mockReturnValue(
			timeoutSignal,
		);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ id: 'n10n-uuid' }, { status: 201 }),
		);

		const result = await sendAppNotification(request);

		expect(result).toEqual({ id: 'n10n-uuid' });
		expect(fetcher).toHaveBeenCalledWith(
			'https://n10n.example.com/push/topic',
			{
				method: 'POST',
				headers: {
					Authorization: 'Bearer secret-api-key',
					'Content-Type': 'application/json; charset=utf-8',
				},
				body: JSON.stringify({
					id: 'push-1',
					type: 'news',
					title: 'Breaking news',
					message: 'World leaders gather in Geneva as talks open.',
					sender: 'notifications-tooling-spa/v1',
					link: {
						url: 'https://www.theguardian.com/world/2026/jul/08/ukraine-summit',
					},
					importance: 'Major',
					topic: [
						{ type: 'breaking', name: 'uk' },
						{ type: 'breaking', name: 'us' },
					],
					debug: false,
					dryRun: false,
				}),
				signal: timeoutSignal,
			},
		);
		expect(timeout).toHaveBeenCalledWith(10_000);
	});

	it('includes image and thumbnail when media is provided', async () => {
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ id: 'n10n-uuid' }, { status: 201 }),
		);

		await sendAppNotification({
			...request,
			media: {
				type: 'image',
				imageUrl: 'https://i.guim.co.uk/lead.jpg',
				thumbnailUrl: 'https://i.guim.co.uk/thumb.jpg',
			},
		});

		const sentBody = JSON.parse(
			fetcher.mock.calls[0]?.[1]?.body as string,
		) as Record<string, unknown>;
		expect(sentBody.imageUrl).toBe('https://i.guim.co.uk/lead.jpg');
		expect(sentBody.thumbnailUrl).toBe('https://i.guim.co.uk/thumb.jpg');
	});

	it('generates a UUID id when none is supplied', async () => {
		const uuid = spyOn(crypto, 'randomUUID').mockReturnValue(
			'11111111-1111-1111-1111-111111111111',
		);
		const fetcher = spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ id: 'n10n-uuid' }, { status: 201 }),
		);

		const { id: _omitted, ...withoutId } = request;
		void _omitted;
		await sendAppNotification(withoutId);

		const sentBody = JSON.parse(
			fetcher.mock.calls[0]?.[1]?.body as string,
		) as Record<string, unknown>;
		expect(sentBody.id).toBe('11111111-1111-1111-1111-111111111111');
		uuid.mockRestore();
	});

	it('rejects an empty topic list before calling the service', () => {
		const fetcher = spyOn(globalThis, 'fetch');

		expect(sendAppNotification({ ...request, topics: [] })).rejects.toThrow(
			'must target at least one topic',
		);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('rejects more than the maximum number of topics', () => {
		const fetcher = spyOn(globalThis, 'fetch');
		const topics = Array.from(
			{ length: MAX_APP_NOTIFICATION_TOPICS + 1 },
			(_, index) => ({ type: 'breaking', name: `edition-${index}` }),
		);

		expect(sendAppNotification({ ...request, topics })).rejects.toThrow(
			`at most ${MAX_APP_NOTIFICATION_TOPICS} topics`,
		);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('throws a safe error when the service rejects the push', () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			new Response('Too many topics, maximum: 20', { status: 400 }),
		);

		expect(sendAppNotification(request)).rejects.toThrow(
			'App notification push failed with status 400.',
		);
	});

	it('classifies timeouts', async () => {
		const timeoutError = new Error('request timed out');
		timeoutError.name = 'TimeoutError';
		spyOn(globalThis, 'fetch').mockRejectedValue(timeoutError);

		try {
			await sendAppNotification(request);
			expect.unreachable();
		} catch (error) {
			expect(error).toMatchObject({
				name: 'AppNotificationApiError',
				reason: 'timeout',
			});
		}
	});

	it('classifies network errors', async () => {
		spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection reset'));

		try {
			await sendAppNotification(request);
			expect.unreachable();
		} catch (error) {
			expect(error).toMatchObject({
				name: 'AppNotificationApiError',
				reason: 'network_error',
			});
		}
	});

	it('classifies a malformed success response', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(
			Response.json({ notId: true }, { status: 201 }),
		);

		try {
			await sendAppNotification(request);
			expect.unreachable();
		} catch (error) {
			expect(error).toMatchObject({
				name: 'AppNotificationApiError',
				reason: 'invalid_response',
			});
		}
	});
});
