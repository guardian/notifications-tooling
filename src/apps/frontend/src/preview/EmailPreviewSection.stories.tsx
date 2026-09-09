import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type { completeEmailParams } from '../testing/story-helpers';
import {
	populatedEmailState,
	WithNotificationContext,
} from '../testing/story-helpers';
import type { NotificationState } from '../types';
import { EmailPreviewSection } from './EmailPreviewSection';

type StoryArgs = {
	notificationState: NotificationState;
	formValues?: Partial<typeof completeEmailParams>;
};

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/EmailPreviewSection',
	component: EmailPreviewSection,
	args: {
		notificationState: populatedEmailState,
	},
	render: ({ notificationState, formValues }) =>
		WithNotificationContext(
			<EmailPreviewSection />,
			notificationState,
			{},
			'email',
			formValues,
		),
	parameters: {
		docs: {
			description: {
				component:
					'Preview section showing selected channel, delivery timing, and audience segments.',
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Preview')).toBeVisible();
		await expect(
			canvas.getByText(
				'The preview for the newsletter email will be shown below.',
			),
		).toBeVisible();
		await expect(
			canvas.getByText(
				'Email appearance may vary across different email clients and devices',
			),
		).toBeVisible();
	},
};

export const WithChannel: Story = {};

export const WithDeliveryTiming: Story = {};

export const WithSegments: Story = {
	args: {
		notificationState: populatedEmailState,
		formValues: { audienceSegments: ['UK', 'US'] },
	},
};

export const FullyPopulated: Story = {
	args: {
		notificationState: populatedEmailState,
		formValues: { audienceSegments: ['UK', 'US', 'AU'] },
	},
};
