import { afterEach, describe, expect, it, mock } from 'bun:test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import '../../happydom-setup';
import { ApiError } from '../api-client/errors';
import {
	defaultNotificationFormContext,
	NotificationFormContext,
	type NotificationFormContextProps,
} from '../compose/NotificationFormContext';
import { PreviousSendContext } from '../previous-send/PreviousSendContext';
import { notificationRoutes, withArticleUrl } from '../routes';
import { TelemetryContext } from '../telemetry/TelemetryContext';
import {
	TelemetryEvent,
	TelemetryService,
} from '../telemetry/telemetryService';
import {
	deliveredNewsletterEmailSendResponse,
	failedNewsletterSendResponse,
} from '../testing/api-fixtures';
import { articleFixture } from '../testing/capi-fixtures';
import {
	completeAppAlertFormValues,
	completeNewsletterEmailFormValues,
} from '../testing/story-fixtures';
import type { ChannelOption, NotificationComposerAction } from '../types';
import {
	buildAppAlertRequest,
	buildNewsletterEmailRequest,
} from '../utils/build-request-payloads';
import { getNotificationHistoryQueryKey } from './useNotificationHistory';
import { notificationSendersQueryKey } from './useNotificationSenders';
import {
	invalidateNotificationHistoryAfterSend,
	useSendNotification,
} from './useSendNotification';

const historyQueryKey = getNotificationHistoryQueryKey({
	limit: 20,
	offset: 0,
});
const latest24HoursQueryKey = getNotificationHistoryQueryKey({
	limit: 20,
	offset: 0,
	since: 1_700_000_000,
	cacheScope: 'last-24-hours',
});

const createPopulatedQueryClient = async () => {
	const queryClient = new QueryClient();
	let historyRequestCount = 0;
	let latest24HoursRequestCount = 0;
	let sendersRequestCount = 0;
	await queryClient.fetchQuery({
		queryKey: historyQueryKey,
		queryFn: () => Promise.resolve(++historyRequestCount),
	});
	await queryClient.fetchQuery({
		queryKey: latest24HoursQueryKey,
		queryFn: () => Promise.resolve(++latest24HoursRequestCount),
	});
	await queryClient.fetchQuery({
		queryKey: notificationSendersQueryKey,
		queryFn: () => Promise.resolve(++sendersRequestCount),
	});
	return {
		queryClient,
		requestCounts: () => ({
			historyRequestCount,
			latest24HoursRequestCount,
			sendersRequestCount,
		}),
	};
};

describe('invalidateNotificationHistoryAfterSend', () => {
	it.each([
		{
			name: 'successful send',
			result: {
				success: true,
				data: deliveredNewsletterEmailSendResponse,
			} as const,
		},
		{
			name: 'persisted dispatch failure',
			result: {
				success: false,
				failure: {
					failure: 'dispatch-fail',
					notification: failedNewsletterSendResponse,
				},
			} as const,
		},
	])(
		'refreshes history and latest 24 hours after a $name',
		async ({ result }) => {
			const { queryClient, requestCounts } = await createPopulatedQueryClient();

			await invalidateNotificationHistoryAfterSend(queryClient, result);

			expect(requestCounts()).toEqual({
				historyRequestCount: 2,
				latest24HoursRequestCount: 2,
				sendersRequestCount: 2,
			});
		},
	);

	it('does not invalidate history when no notification was persisted', async () => {
		const { queryClient, requestCounts } = await createPopulatedQueryClient();

		await invalidateNotificationHistoryAfterSend(queryClient, {
			success: false,
			failure: new ApiError({
				message: 'Network request failed',
				failure: 'fetch-fail',
			}),
		});

		expect(requestCounts()).toEqual({
			historyRequestCount: 1,
			latest24HoursRequestCount: 1,
			sendersRequestCount: 1,
		});
	});
});

const originalConsoleError = console.error;

afterEach(() => {
	cleanup();
	console.error = originalConsoleError;
});

const setupSendHook = (
	channel: ChannelOption,
	implementation: NotificationFormContextProps['sendNotification'],
) => {
	const sendNotification = mock(implementation);
	const updateComposerState = mock<
		(action: NotificationComposerAction) => void
	>(() => undefined);
	const setPreviousSend = mock(() => undefined);
	const telemetry = new TelemetryService('send-test', 'DEV');
	const sendEvent = mock<TelemetryService['sendEvent']>(() => undefined);
	telemetry.sendEvent = sendEvent;
	const logError = mock(() => undefined);
	console.error = logError;
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	const wrapper = ({ children }: PropsWithChildren) => (
		<QueryClientProvider client={queryClient}>
			<MemoryRouter initialEntries={[notificationRoutes[channel].create]}>
				<TelemetryContext.Provider value={telemetry}>
					<PreviousSendContext.Provider value={{ setPreviousSend }}>
						<NotificationFormContext.Provider
							value={{
								...defaultNotificationFormContext,
								channel,
								sendNotification,
								updateComposerState,
							}}
						>
							{children}
						</NotificationFormContext.Provider>
					</PreviousSendContext.Provider>
				</TelemetryContext.Provider>
			</MemoryRouter>
		</QueryClientProvider>
	);
	const hook = renderHook(
		() => ({ send: useSendNotification(), location: useLocation() }),
		{ wrapper },
	);
	return {
		...hook,
		sendNotification,
		updateComposerState,
		setPreviousSend,
		sendEvent,
		logError,
	};
};

describe.each(['newsletter', 'app-push'] as const)(
	'useSendNotification (%s)',
	(channel) => {
		const request =
			channel === 'newsletter'
				? buildNewsletterEmailRequest({
						values: completeNewsletterEmailFormValues,
						article: articleFixture,
						idempotencyKey: 'send-test-key',
					})
				: buildAppAlertRequest({
						values: completeAppAlertFormValues,
						alertTypeLabel: 'Breaking news',
						article: articleFixture,
						idempotencyKey: 'send-test-key',
					});

		it.each(['rejection', 'synchronous throw'] as const)(
			'converts an unexpected %s into a logged send failure without retrying',
			async (mode) => {
				const cause = new Error('Unexpected send failure');
				const {
					result,
					sendNotification,
					updateComposerState,
					setPreviousSend,
					sendEvent,
					logError,
				} = setupSendHook(channel, () => {
					if (mode === 'synchronous throw') {
						throw cause;
					}
					return Promise.reject(cause);
				});

				await act(async () => {
					await result.current.send(request);
				});

				expect(updateComposerState).toHaveBeenNthCalledWith(1, {
					type: 'waiting-for-send',
				});
				const failureAction = updateComposerState.mock.calls.at(-1)?.[0];
				if (failureAction?.type !== 'receive-send-failure') {
					throw new Error('Expected the rejected send to publish a failure');
				}
				expect(failureAction.failure).toBeInstanceOf(ApiError);
				expect(failureAction.failure).toMatchObject({
					failure: 'fetch-fail',
					cause,
				});
				expect(logError).toHaveBeenCalledWith(
					'Unexpected notification send failure',
					{ cause, idempotencyKey: request.idempotencyKey, channel },
				);
				expect(sendEvent).toHaveBeenCalledWith(
					TelemetryEvent.FailedNotificationEvent,
					{
						idempotencyKey: request.idempotencyKey,
						channel,
						failure: 'fetch-fail',
					},
				);
				expect(sendNotification).toHaveBeenCalledTimes(1);
				expect(setPreviousSend).not.toHaveBeenCalled();
				expect(result.current.location.pathname).toBe(
					notificationRoutes[channel].create,
				);
			},
		);

		it('preserves a rejected ApiError and its diagnostic details', async () => {
			const failure = new ApiError({
				message: 'The request was not permitted',
				failure: 'forbidden',
				status: 403,
				requestId: 'request-123',
			});
			const { result, updateComposerState } = setupSendHook(channel, () =>
				Promise.reject(failure),
			);

			await act(async () => {
				await result.current.send(request);
			});

			expect(updateComposerState).toHaveBeenLastCalledWith({
				type: 'receive-send-failure',
				failure,
			});
		});

		it('completes and navigates after an explicit retry of the same request', async () => {
			let attempts = 0;
			const { result, sendNotification, setPreviousSend, updateComposerState } =
				setupSendHook(channel, () => {
					attempts++;
					return attempts === 1
						? Promise.reject(new Error('Unexpected send failure'))
						: Promise.resolve({
								success: true,
								data: deliveredNewsletterEmailSendResponse,
							});
				});

			await act(async () => {
				await result.current.send(request);
			});
			expect(sendNotification).toHaveBeenCalledTimes(1);
			expect(setPreviousSend).not.toHaveBeenCalled();

			await act(async () => {
				await result.current.send(request);
			});

			expect(sendNotification).toHaveBeenCalledTimes(2);
			expect(sendNotification.mock.calls[0]?.[0]).toBe(request);
			expect(sendNotification.mock.calls[1]?.[0]).toBe(request);
			expect(setPreviousSend).toHaveBeenCalledWith({
				notificationId: deliveredNewsletterEmailSendResponse.id,
			});
			expect(updateComposerState).toHaveBeenLastCalledWith({
				type: 'complete-send',
			});
			const destination = new URL(
				withArticleUrl(
					notificationRoutes[channel].report,
					articleFixture.webUrl,
				),
				'http://localhost',
			);
			expect(result.current.location.pathname).toBe(destination.pathname);
			expect(result.current.location.search).toBe(destination.search);
		});
	},
);
