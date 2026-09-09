import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { RefreshButton } from './RefreshButton';

const meta = {
	title: 'Stand Frontend/RefreshButton',
	component: RefreshButton,
	args: {
		onRefresh: fn(),
	},
} satisfies Meta<typeof RefreshButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole('button', { name: 'Refresh activity' });

		await userEvent.click(button);
		await expect(args.onRefresh).toHaveBeenCalledOnce();
	},
};

export const Refreshing: Story = {
	args: {
		isRefreshing: true,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			canvas.getByRole('button', { name: 'Refresh activity' }),
		).toBeDisabled();
	},
};