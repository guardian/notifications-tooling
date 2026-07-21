import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Page } from './Page';

const meta = {
	title: 'Notifications Tool Page',
	component: Page,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotificationsPage: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const CreateNotificationHeading = canvas.getByText(
			'Create a Notification',
			{
				selector: 'h2',
			},
		);
		await expect(CreateNotificationHeading).toBeInTheDocument();
	},
};
