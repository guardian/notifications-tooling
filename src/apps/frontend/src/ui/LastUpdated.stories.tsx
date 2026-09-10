import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LastUpdated } from './LastUpdated';

const updatedAt = new Date(Date.now() - 5 * 60_000).toISOString();

const meta = {
	title: 'Dispatch/UI/LastUpdated',
	component: LastUpdated,
	args: { updatedAt },
} satisfies Meta<typeof LastUpdated>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const label = canvas.getByText('Last updated:');
		const time = within(label).getByRole('time');

		await expect(time).toHaveTextContent(/^5 mins? ago$/);
		await expect(time).toHaveAttribute('datetime', updatedAt);
		await expect(time).toHaveAttribute('title');
	},
};

export const JustNow: Story = {
	args: {
		updatedAt: new Date(Date.now() - 30_000).toISOString(),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			within(canvas.getByText('Last updated:')).getByRole('time'),
		).toHaveTextContent('just now');
	},
};
