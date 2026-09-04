import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ChannelDisplay } from './ChannelDisplay';

const meta = {
	title: 'Stand Frontend/ChannelDisplay',
	component: ChannelDisplay,
	parameters: {
		docs: {
			description: {
				component:
					'Displays the notification channel configured by the current route.',
			},
		},
	},
} satisfies Meta<typeof ChannelDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewsletterEmail: Story = {
	args: { channel: 'email' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByRole('region', { name: 'Channel' })).toBeVisible();
		await expect(canvas.getByText('Newsletter email')).toBeVisible();
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
	},
};

export const AppAlert: Story = {
	args: { channel: 'push' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('App alert')).toBeVisible();
		await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
	},
};
