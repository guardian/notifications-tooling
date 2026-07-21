import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { HistoryTab } from './HistoryTab';

const meta = {
	title: 'Stand Frontend/HistoryTab',
	component: HistoryTab,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof HistoryTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('History Tab')).toBeInTheDocument();
	},
};
