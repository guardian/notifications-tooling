import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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
		await expect(canvas.getByText(args.content.section)).toBeVisible();
		await expect(
			canvas.getByText(`/ ${args.content.pillarName}`),
		).toBeVisible();
		const publishedTime = canvasElement.querySelector('time');
		await expect(publishedTime).toBeVisible();
		await expect(publishedTime).toHaveAttribute('datetime');
		await expect(
			canvas.getByRole('link', { name: new RegExp(args.content.headline) }),
		).toBeVisible();
		const createButton = canvas.getByRole('button', { name: /create/i });
		await expect(createButton).toBeVisible();
		await expect(getComputedStyle(createButton).backgroundColor).toBe(
			'rgb(255, 255, 255)',
		);
		await userEvent.hover(createButton);
		await expect(getComputedStyle(createButton).backgroundColor).toBe(
			'rgb(246, 246, 246)',
		);
	},
};

export const WideRow: Story = {
	render: (args) => (
		<div style={{ width: '676px' }}>
			<LatestPublishedContentCard {...args} />
		</div>
	),
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
