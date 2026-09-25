import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { userEvent, within } from 'storybook/test';
import type { HistoryNotification } from '../history/HistoryView';
import { articleFixture } from '../testing/capi-fixtures';
import { NewNotificationToast } from './NewNotificationToast';

const notification: HistoryNotification = {
	id: 'new-notification',
	title: 'Prime minister announces cabinet reshuffle',
	href: 'https://www.theguardian.com/politics/example',
	thumbnailUrl: articleFixture.fields?.thumbnail,
	channel: 'app-push',
	alertType: 'Breaking news',
	sentBy: 'alex@example.com',
	sentTo: ['UK'],
	sentAt: '2026-09-25T10:00:00.000Z',
	status: 'Sent',
};

const ToastHarness = () => {
	const [isVisible, setIsVisible] = useState(true);
	return isVisible ? (
		<NewNotificationToast
			notification={notification}
			onDismiss={() => setIsVisible(false)}
		/>
	) : null;
};

const meta = {
	title: 'Dispatch/UI/NewNotificationToast',
	component: ToastHarness,
} satisfies Meta<typeof ToastHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewAppAlert: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		canvas.getByText('An app alert was sent just now by: alex@example.com');
		await userEvent.click(canvas.getByLabelText('Dismiss notification'));
		if (
			canvas.queryByText('An app alert was sent just now by: alex@example.com')
		) {
			throw new Error('Expected the notification to be dismissed');
		}
	},
};
