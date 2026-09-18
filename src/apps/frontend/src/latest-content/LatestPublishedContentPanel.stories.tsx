import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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
		await expect(
			canvas.getByRole('heading', { name: 'Latest published content' }),
		).toBeVisible();
		await expect(
			canvas.getByRole('columnheader', {
				name: 'Latest published content',
				hidden: true,
			}),
		).toBeInTheDocument();
		await expect(
			canvas.getByText('Choose a recent article from below to create an alert'),
		).toBeVisible();
		const showAllButton = await canvas.findByRole('button', {
			name: 'Show all',
		});
		await expect(
			canvas.getAllByRole('button', { name: /create/i }),
		).toHaveLength(3);
		await userEvent.click(showAllButton);
		await expect(showAllButton).not.toBeInTheDocument();
		await expect(
			await canvas.findAllByRole('button', { name: /create/i }),
		).toHaveLength(6);
	},
};
