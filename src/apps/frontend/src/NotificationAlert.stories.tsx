import { Button } from '@guardian/stand/Button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { ConfigContext } from './config/ConfigContext';
import {
	getNotificationHistoryQueryKey,
	type NotificationHistoryQuery,
} from './hooks/useNotificationHistory';
import { NotificationAlert } from './NotificationAlert';
import type { NotificationListResponse, NotificationSummary } from './schemas';
import {
	appPushSendBeyondBradford,
	newsletterSendBeyondBradford,
} from './testing/api-fixtures';
import { mockAppConfig } from './testing/app-config';

const historyQuery: NotificationHistoryQuery = { limit: 10, offset: 0 };
const historyQueryKey = getNotificationHistoryQueryKey(historyQuery);
const emptyHistory: NotificationListResponse = {
	total: 0,
	limit: 10,
	offset: 0,
	notifications: [],
};
const partiallyDeliveredAppPush: NotificationSummary = {
	...appPushSendBeyondBradford,
	id: 'partially-delivered-app-push',
	status: 'partially_delivered',
	createdByEmail: 'partial.sender@guardian.co.uk',
};
const currentUserAppPush: NotificationSummary = {
	...appPushSendBeyondBradford,
	id: 'current-user-app-push',
	createdByEmail: mockAppConfig.user.email.toUpperCase(),
};
const acceptedAppPush: NotificationSummary = {
	...appPushSendBeyondBradford,
	id: 'accepted-app-push',
	status: 'accepted',
	createdByEmail: 'transition.sender@guardian.co.uk',
};

const NotificationAlertExample = () => {
	const queryClient = useQueryClient();
	useState(() => queryClient.setQueryData(historyQueryKey, emptyHistory));

	return (
		<>
			<Button
				onPress={() =>
					queryClient.setQueryData<NotificationListResponse>(historyQueryKey, {
						...emptyHistory,
						total: 4,
						notifications: [
							appPushSendBeyondBradford,
							newsletterSendBeyondBradford,
							partiallyDeliveredAppPush,
							currentUserAppPush,
						],
					})
				}
			>
				Receive notifications
			</Button>
			<NotificationAlert />
		</>
	);
};

const AcceptedNotificationExample = () => {
	const queryClient = useQueryClient();
	useState(() =>
		queryClient.setQueryData<NotificationListResponse>(historyQueryKey, {
			...emptyHistory,
			total: 1,
			notifications: [acceptedAppPush],
		}),
	);

	return (
		<>
			<Button
				onPress={() =>
					queryClient.setQueryData<NotificationListResponse>(historyQueryKey, {
						...emptyHistory,
						total: 1,
						notifications: [{ ...acceptedAppPush, status: 'delivered' }],
					})
				}
			>
				Complete delivery
			</Button>
			<NotificationAlert />
		</>
	);
};

const meta = {
	title: 'Dispatch/Layout/NotificationAlert',
	component: NotificationAlert,
	decorators: [
		(Story) => (
			<ConfigContext.Provider value={mockAppConfig}>
				<Story />
			</ConfigContext.Provider>
		),
	],
} satisfies Meta<typeof NotificationAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IncomingAppAlert: Story = {
	render: () => <NotificationAlertExample />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);

		await userEvent.click(
			canvas.getByRole('button', { name: 'Receive notifications' }),
		);

		const toasts = await page.findAllByRole('alert');
		await expect(toasts).toHaveLength(2);
		await expect(page.getByText('Sent an app alert')).toBeVisible();
		await expect(page.getByText('Sent a newsletter email')).toBeVisible();
		await expect(page.getByText('AN')).toBeVisible();
		await expect(page.getByText('JD')).toBeVisible();
		await userEvent.hover(page.getByText('AN'));
		await expect(await page.findByRole('tooltip')).toHaveTextContent(
			'Ann Nonymous',
		);
		await expect(page.getAllByText('Sent to')).toHaveLength(2);
		for (const audience of [
			'United States',
			'International',
			'Europe',
			'United Kingdom',
		]) {
			await expect(page.getByRole('img', { name: audience })).toBeVisible();
		}
		await expect(
			page.getAllByText(
				'Beyond Bradford and the Brontës – new walking trail shows West Yorkshire’s natural beauty',
			),
		).toHaveLength(2);
		await expect(
			page.getAllByText(
				'https://www.theguardian.com/travel/2026/sep/17/bradford-pennine-gateway-walking-trail-west-yorkshire',
			),
		).toHaveLength(2);
	},
};

export const DeliveryCompletesAfterPolling: Story = {
	render: () => <AcceptedNotificationExample />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);

		await expect(page.queryByText('TS')).not.toBeInTheDocument();
		await userEvent.click(
			canvas.getByRole('button', { name: 'Complete delivery' }),
		);

		await expect(await page.findByText('TS')).toBeVisible();
	},
};
