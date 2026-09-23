import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { NotFoundTab } from './NotFoundTab';

const meta = {
	title: 'Dispatch/Layout/NotFoundTab',
	component: NotFoundTab,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotFoundTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Page not found' }),
		).toBeVisible();
		await expect(
			canvas.getByRole('link', { name: 'Go to Create newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
	},
};
