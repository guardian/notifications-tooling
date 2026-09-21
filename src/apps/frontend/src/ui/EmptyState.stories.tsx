import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { EmptyState } from './EmptyState';

const meta = {
	title: 'Dispatch/UI/EmptyState',
	component: EmptyState,
	parameters: {
		layout: 'centered',
	},
	args: {
		title: 'No published content yet',
		description: 'Published articles will appear here.',
		icon: 'article',
	},
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PublishedContent: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'No published content yet' }),
		).toBeVisible();
		await expect(
			canvas.getByText('Published articles will appear here.'),
		).toBeVisible();
	},
};

export const Alerts: Story = {
	args: {
		title: 'No alerts yet',
		description: 'Alerts will appear here after they have been sent.',
		icon: 'notifications',
	},
};
