import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { TestEmailForm } from './TestEmailForm';

type StoryArgs = {
	notificationState: NotificationState;
};

type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/TestEmailForm',
	component: TestEmailForm,
	args: {
		notificationState: defaultState,
	},
	render: ({ notificationState }) =>
		WithNotificationContext(<TestEmailForm />, notificationState),
};

export default meta;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('button', { name: 'Send test notification' }),
		).toBeDisabled();
		await expect(
			canvas.getByPlaceholderText('name@theguardian.com'),
		).toBeInTheDocument();
	},
};

export const WithValidEmail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		await userEvent.type(input, 'joe.blogs@theguardian.com');
		await expect(
			canvas.getByRole('button', { name: 'Send test notification' }),
		).toBeEnabled();
	},
};
export const WithNonGuardianEmail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		await userEvent.type(input, 'joe.blogs@example.com');
		await expect(
			canvas.getByRole('button', { name: 'Send test notification' }),
		).toBeDisabled();
	},
};
export const WithInvalidEmail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		await userEvent.type(input, 'joe.blogs^example.com');
		await expect(
			canvas.getByRole('button', { name: 'Send test notification' }),
		).toBeDisabled();
	},
};
