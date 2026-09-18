import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FlagPair } from './FlagPair';

const meta = {
	title: 'Stand Frontend/UI/FlagPair',
	component: FlagPair,
	args: {
		from: 'UK',
		to: 'INT',
	},
	parameters: {
		layout: 'centered',
	},
} satisfies Meta<typeof FlagPair>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByLabelText('UK to INT')).toBeVisible();
	},
};
