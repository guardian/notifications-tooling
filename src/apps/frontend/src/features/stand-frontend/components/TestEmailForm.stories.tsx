import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ApiError } from '../../../api/errors';
import { mockFailingRequestTestEmailSend } from '../../../mocks/mock-request-test-email-send';
import {
	populatedEmailState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
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
		notificationState: populatedEmailState,
	},
	render: ({ notificationState }) =>
		WithNotificationContext(<TestEmailForm />, notificationState),
};

export default meta;

const BUTTON_TEXT = 'Send test';

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('button', { name: BUTTON_TEXT }),
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
			canvas.getByRole('button', { name: BUTTON_TEXT }),
		).toBeEnabled();
	},
};
export const WithNonGuardianEmail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		await userEvent.type(input, 'joe.blogs@example.com');
		await expect(
			canvas.getByRole('button', { name: BUTTON_TEXT }),
		).toBeDisabled();
	},
};
export const WithInvalidEmail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		await userEvent.type(input, 'joe.blogs^example.com');
		await expect(
			canvas.getByRole('button', { name: BUTTON_TEXT }),
		).toBeDisabled();
	},
};
export const SentTestEmail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		const button = canvas.getByRole('button', {
			name: BUTTON_TEXT,
		});
		await userEvent.type(input, 'joe.blogs@theguardian.com');
		await userEvent.click(button);

		await waitFor(() =>
			expect(canvas.getByText('Test email sent')).toBeInTheDocument(),
		);
	},
};

export const FailingTestEmail: Story = {
	render: ({ notificationState }) =>
		WithNotificationContext(<TestEmailForm />, notificationState, {
			requestTestEmailSend: mockFailingRequestTestEmailSend(
				new ApiError({ message: 'test error', failure: 'non-2xx-response' }),
			),
		}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		const button = canvas.getByRole('button', {
			name: BUTTON_TEXT,
		});
		await userEvent.type(input, 'joe.blogs@theguardian.com');
		await userEvent.click(button);

		await waitFor(() =>
			expect(canvas.getByText(/^Test email failed/)).toBeInTheDocument(),
		);
	},
};
