import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { mockLatestPublishedContent } from './latest-published-content';
import { LatestPublishedContentCard } from './LatestPublishedContentCard';

const meta = {
	title: 'Stand Frontend/DispatchLanding/LatestPublishedContentCard',
	component: LatestPublishedContentCard,
	args: {
		content: mockLatestPublishedContent[0],
	},
	parameters: {
		layout: 'centered',
	},
	render: (args) => (
		<div style={{ width: '380px' }}>
			<LatestPublishedContentCard {...args} />
		</div>
	),
} satisfies Meta<typeof LatestPublishedContentCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('link', { name: new RegExp(args.content.headline) }),
		).toBeVisible();
		await expect(canvas.getByRole('button', { name: /create/i })).toBeVisible();
	},
};

export const NoImage: Story = {
	args: {
		content: { ...mockLatestPublishedContent[0]!, imageUrl: undefined },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('No image')).toBeVisible();
	},
};

export const UnknownPillar: Story = {
	args: {
		content: mockLatestPublishedContent[5],
	},
};
