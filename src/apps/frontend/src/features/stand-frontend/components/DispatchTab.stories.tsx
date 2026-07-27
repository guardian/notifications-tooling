import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DispatchTab } from './DispatchTab';

const meta = {
	title: 'Stand Frontend/DispatchTab',
	component: DispatchTab,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Dispatch tab combining the notification creation form and  preview with selected audience, channel, and delivery timing.',
			},
		},
	},
} satisfies Meta<typeof DispatchTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Create a Notification')).toBeInTheDocument();
		await expect(canvas.getByText('Preview')).toBeInTheDocument();
	},
};
