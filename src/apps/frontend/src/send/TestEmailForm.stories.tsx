import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ApiError } from '../api-client/errors';
import {
	mockFailingRequestTestEmailSend,
	mockRequestTestEmailSend,
} from '../testing/mock-request-test-email-send';
import {
	completeNewsletterEmailFormValues,
	populatedNewsletterEmailComposerState,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import type {
	TestEmailRequestFunction,
	TestEmailSendRequest,
} from '../utils/send-test-email';
import { TestEmailForm } from './TestEmailForm';

type StoryArgs = {
	composerState: NotificationComposerState;
	requestTestEmailSend?: TestEmailRequestFunction;
};

type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Send/TestEmailForm',
	component: TestEmailForm,
	args: {
		composerState: populatedNewsletterEmailComposerState,
	},
	render: function Render({ composerState, requestTestEmailSend }) {
		return useNotificationFormStory(
			<TestEmailForm />,
			composerState,
			{ requestTestEmailSend },
			'newsletter',
			completeNewsletterEmailFormValues,
		);
	},
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

const requestedLiveblogUrl =
	'https://www.theguardian.com/world/live/2026/sep/04/latest-developments#block-6a9af4938f0834a1091dfae4';
let lastBlockTestEmailRequest: TestEmailSendRequest | undefined;
const requestBlockTestEmailSend: TestEmailRequestFunction = (request) => {
	lastBlockTestEmailRequest = request;
	return mockRequestTestEmailSend(request);
};

export const RequestedLiveblogBlock: Story = {
	args: {
		composerState: {
			...populatedNewsletterEmailComposerState,
			requestedUrl: requestedLiveblogUrl,
		},
		requestTestEmailSend: requestBlockTestEmailSend,
	},
	play: async ({ canvasElement }) => {
		lastBlockTestEmailRequest = undefined;
		const canvas = within(canvasElement);
		await userEvent.type(
			canvas.getByPlaceholderText('name@theguardian.com'),
			'joe.blogs@theguardian.com',
		);
		await userEvent.click(canvas.getByRole('button', { name: BUTTON_TEXT }));

		await waitFor(() =>
			expect(lastBlockTestEmailRequest?.content.items['lead-story']?.link).toBe(
				requestedLiveblogUrl,
			),
		);
	},
};

export const FailingTestEmail: Story = {
	render: function Render({ composerState }) {
		return useNotificationFormStory(
			<TestEmailForm />,
			composerState,
			{
				requestTestEmailSend: mockFailingRequestTestEmailSend(
					new ApiError({
						message: 'test error',
						failure: 'non-2xx-response',
					}),
				),
			},
			'newsletter',
			completeNewsletterEmailFormValues,
		);
	},
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

export const RetryAfterFailure: Story = {
	render: function Render({ composerState }) {
		let sendAttempts = 0;
		return useNotificationFormStory(
			<TestEmailForm />,
			composerState,
			{
				requestTestEmailSend: (request) => {
					sendAttempts += 1;
					return sendAttempts === 1
						? mockFailingRequestTestEmailSend(
								new ApiError({
									message: 'test error',
									failure: 'non-2xx-response',
								}),
							)(request)
						: mockRequestTestEmailSend(request);
				},
			},
			'newsletter',
			completeNewsletterEmailFormValues,
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('name@theguardian.com');
		const button = canvas.getByRole('button', { name: BUTTON_TEXT });
		await userEvent.type(input, 'joe.blogs@theguardian.com');
		await userEvent.click(button);

		await expect(
			canvas.findByText(/^Test email failed/),
		).resolves.toBeVisible();

		await userEvent.click(button);
		await expect(
			canvas.queryByText(/^Test email failed/),
		).not.toBeInTheDocument();
		await expect(canvas.findByText('Test email sent')).resolves.toBeVisible();
		await expect(
			canvas.queryByText(/^Test email failed/),
		).not.toBeInTheDocument();
	},
};
