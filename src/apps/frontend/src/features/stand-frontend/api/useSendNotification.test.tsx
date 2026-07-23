import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { getApiBaseUrl } from '../../../api/config';
import { ApiError } from '../../../api/errors';
import { server } from '../../../mocks/server';
import { buildDryRunNotificationRequest } from './buildDryRunNotificationRequest';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from './schemas';
import { useSendNotification } from './useSendNotification';

const request: SendNotificationRequest = buildDryRunNotificationRequest(
	'11111111-1111-4111-8111-111111111111',
	{
		articleUrl: 'https://www.theguardian.com/world/2026/jul/22/example',
		kicker: 'none',
		subject: 'Subject',
		previewText: 'Preview',
	},
);

const acceptedResponse: SendNotificationResponse = {
	notificationId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
	status: 'accepted',
	plans: [
		{
			channel: 'newsletter',
			planId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee#newsletter',
			status: 'accepted',
		},
	],
	statusUrl: '/v1/notifications/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/status',
	cancellable: {
		cancelUrl: '/v1/notifications/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee/cancel',
		expiresAt: 1_753_200_000,
	},
};

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};
};

describe('useSendNotification', () => {
	it('sends the envelope and resolves with the accepted response', async () => {
		let receivedRequest: unknown;
		server.use(
			http.post(`${getApiBaseUrl()}/v1/notifications`, async ({ request }) => {
				receivedRequest = await request.json();
				return HttpResponse.json(acceptedResponse, { status: 202 });
			}),
		);
		const { result } = renderHook(() => useSendNotification(), {
			wrapper: createWrapper(),
		});

		result.current.mutate(request);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(receivedRequest).toEqual(request);
		expect(result.current.data).toEqual(acceptedResponse);
	});

	it('surfaces a non-2xx response as an ApiError, without retrying', async () => {
		let attempts = 0;
		server.use(
			http.post(`${getApiBaseUrl()}/v1/notifications`, () => {
				attempts++;
				return HttpResponse.json({ error: 'boom' }, { status: 500 });
			}),
		);

		const { result } = renderHook(() => useSendNotification(), {
			wrapper: createWrapper(),
		});

		result.current.mutate(request);

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBeInstanceOf(ApiError);
		expect(attempts).toBe(1);
	});
});
