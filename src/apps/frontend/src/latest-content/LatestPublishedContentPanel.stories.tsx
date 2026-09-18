import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LatestPublishedContentPanel } from './LatestPublishedContentPanel';

const meta = {
	title: 'Stand Frontend/DispatchLanding/LatestPublishedContentPanel',
	component: LatestPublishedContentPanel,
	parameters: {
		layout: 'centered',
	},
	render: () => (
		<div style={{ width: '380px' }}>
			<LatestPublishedContentPanel />
		</div>
	),
} satisfies Meta<typeof LatestPublishedContentPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Latest published content')).toBeVisible();
		await expect(
			canvas.getByText('Choose a recent article from below to create an alert'),
		).toBeVisible();
	},
};
