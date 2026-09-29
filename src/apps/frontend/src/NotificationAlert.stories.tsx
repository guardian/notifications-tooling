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
import type { NotificationListResponse } from './schemas';
import { appPushSendBeyondBradford } from './testing/api-fixtures';
import { mockAppConfig } from './testing/app-config';

const historyQuery: NotificationHistoryQuery = { limit: 10, offset: 0 };
const historyQueryKey = getNotificationHistoryQueryKey(historyQuery);
const emptyHistory: NotificationListResponse = {
	total: 0,
	limit: 10,
	offset: 0,
	notifications: [],
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
						total: 1,
						notifications: [appPushSendBeyondBradford],
					})
				}
			>
				Receive notification
			</Button>
			<NotificationAlert />
		</>
	);
};

const meta = {
	title: 'Dispatch/NotificationAlert',
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
			canvas.getByRole('button', { name: 'Receive notification' }),
		);

		const toast = await page.findByRole('alert');
		await expect(toast).toHaveTextContent(
			'ann.nonymous@guardian.co.uk sent an app alert',
		);
		await expect(toast).toHaveTextContent(
			'Beyond Bradford and the Brontës – new walking trail shows West Yorkshire’s natural beauty',
		);
		await expect(toast).toHaveTextContent(
			'https://www.theguardian.com/travel/2026/sep/17/bradford-pennine-gateway-walking-trail-west-yorkshire',
		);
	},
};
