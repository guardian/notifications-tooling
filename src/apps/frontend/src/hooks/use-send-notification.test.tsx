import { afterEach, describe, expect, it, mock } from 'bun:test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter, useLocation } from 'react-router-dom';
import '../../happydom-setup';
import type { Result } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import {
	NotificationFormContext,
	type NotificationFormContextProps,
} from '../compose/NotificationContext';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from '../schemas';
import { acceptedEmailSendResponse } from '../testing/api-fixtures';
import { useSendNotification } from './use-send-notification';
import { notificationHistoryQueryKey } from './useNotificationHistory';

const request = { idempotencyKey: 'test-send' } as SendNotificationRequest;

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
	if (root) {
		act(() => root?.unmount());
	}
	container?.remove();
	root = undefined;
	container = undefined;
});

const renderHook = (
	result: Result<SendNotificationResponse>,
	channel: NotificationFormContextProps['channel'] = 'email',
) => {
	const queryClient = new QueryClient();
	queryClient.setQueryData([...notificationHistoryQueryKey, 'page'], 'cached');
	const updateNotification =
		mock<NotificationFormContextProps['updateNotification']>();
	const sendNotification = mock(() => Promise.resolve(result));
	let send: ReturnType<typeof useSendNotification> | undefined;
	let getDispatchId: (() => string | undefined) | undefined;
	let currentPath = '';

	const HookConsumer = () => {
		send = useSendNotification();
		currentPath = useLocation().pathname;
		return null;
	};

	const Providers = ({ children }: { children: ReactNode }) => {
		const form = useForm<{ dispatchId?: string }>();
		getDispatchId = () => form.getValues('dispatchId');

		return (
			<MemoryRouter initialEntries={[`/${channel}/create`]}>
				<QueryClientProvider client={queryClient}>
					<FormProvider {...form}>
						<NotificationFormContext
							value={{
								channel,
								notification: {
									isFetchingContent: false,
									isWaitingForSend: false,
									confirmSendModalOpen: false,
								},
								updateNotification,
								capiFetch: mock(),
								sendNotification,
								requestEmailHtml: mock(),
								requestTestEmailSend: mock(),
							}}
						>
							{children}
						</NotificationFormContext>
					</FormProvider>
				</QueryClientProvider>
			</MemoryRouter>
		);
	};

	container = document.createElement('div');
	document.body.append(container);
	root = createRoot(container);
	act(() =>
		root?.render(
			<Providers>
				<HookConsumer />
			</Providers>,
		),
	);

	return {
		queryClient,
		updateNotification,
		sendNotification,
		send: () => send?.(request),
		getDispatchId: () => getDispatchId?.(),
		getCurrentPath: () => currentPath,
	};
};

describe('useSendNotification', () => {
	it('completes a successful send and navigates to the report', async () => {
		const harness = renderHook({
			success: true,
			data: acceptedEmailSendResponse,
		});

		const sendPromise = harness.send();
		expect(harness.updateNotification).toHaveBeenCalledWith({
			type: 'waiting-for-send',
		});

		await act(async () => {
			await sendPromise;
		});

		expect(harness.sendNotification).toHaveBeenCalledWith(request);
		expect(harness.getDispatchId()).toBe(acceptedEmailSendResponse.id);
		expect(
			harness.queryClient.getQueryState([
				...notificationHistoryQueryKey,
				'page',
			])?.isInvalidated,
		).toBe(true);
		expect(harness.updateNotification).toHaveBeenLastCalledWith({
			type: 'complete-send',
		});
		expect(harness.getCurrentPath()).toBe('/newsletter-email/report');
	});

	it('reports a rejected send without completing or navigating', async () => {
		const failure = new ApiError({
			failure: 'non-2xx-response',
			message: 'Send failed',
			status: 500,
		});
		const harness = renderHook({ success: false, failure });

		await act(async () => {
			await harness.send();
		});

		expect(harness.updateNotification).toHaveBeenLastCalledWith({
			type: 'receive-send-failure',
			failure,
		});
		expect(harness.getDispatchId()).toBeUndefined();
		expect(harness.getCurrentPath()).toBe('/email/create');
		expect(harness.updateNotification).not.toHaveBeenCalledWith({
			type: 'complete-send',
		});
	});
});
