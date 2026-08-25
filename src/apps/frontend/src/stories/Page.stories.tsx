import { UserPermissions } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { mockAppConfig } from '../mocks/app-config';
import { Page } from './Page';

const meta = {
	title: 'Notifications Tool Page',
	component: Page,
	parameters: {
		layout: 'fullscreen',
	},
	beforeEach() {
		window.__APP_CONFIG__ = mockAppConfig;
	},
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotificationsPage: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const CreateNotificationHeading = canvas.getByText(
			'Create newsletter email',
			{
				selector: 'h2',
			},
		);
		await expect(CreateNotificationHeading).toBeInTheDocument();
	},
};

export const NotificationsPageWithoutSendPermission: Story = {
	beforeEach() {
		window.__APP_CONFIG__ = {
			...mockAppConfig,
			permissions: [UserPermissions.DispatchAccess],
		};
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const CreateNotificationHeading = canvas.getByText(
			'Create newsletter email',
			{
				selector: 'h2',
			},
		);
		await expect(CreateNotificationHeading).toBeInTheDocument();
	},
};

export const NotificationsPageWithoutAccessPermission: Story = {
	beforeEach() {
		window.__APP_CONFIG__ = { ...mockAppConfig, permissions: [] };
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
