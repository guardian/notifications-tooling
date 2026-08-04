import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { mockUserResponse } from '../mocks/app-config';
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
	args: {
		presetUser: mockUserResponse,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const CreateNotificationHeading = canvas.getByText(
			'Create a notification',
			{
				selector: 'h2',
			},
		);
		await expect(CreateNotificationHeading).toBeInTheDocument();
	},
};

export const NotificationsPageWithoutPermission: Story = {
	args: {
		presetUser: { ...mockUserResponse, permissions: [] },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const CreateNotificationHeading = canvas.getByText(
			'contact central production',
			{
				selector: 'a',
			},
		);
		await expect(CreateNotificationHeading).toBeInTheDocument();
	},
};
