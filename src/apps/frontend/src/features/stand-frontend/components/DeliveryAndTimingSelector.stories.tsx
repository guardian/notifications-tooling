import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DeliveryAndTimingSelector } from './DeliveryAndTimingSelector';
import { SendInfoPreviewPill } from './SendInfoPreviewPill';

const meta = {
	title: 'Stand Frontend/DeliveryAndTimingSelector',
	component: DeliveryAndTimingSelector,
	parameters: {
		docs: {
			description: {
				component: 'Delivery and timing selection tile',
			},
		},
	},
} satisfies Meta<typeof DeliveryAndTimingSelector>;

export default meta;
type SelectorStory = StoryObj<typeof meta>;

export const Unselected: SelectorStory = {
	args: {
		selectedDeliveryTiming: undefined,
		onChange: () => {},
		channel: 'email',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Delivery and timing')).toBeInTheDocument();
		await expect(canvas.getByText('Immediate')).toBeInTheDocument();
		await expect(
			canvas.getByText('Sends right now via Braze'),
		).toBeInTheDocument();
	},
};

export const Selected: SelectorStory = {
	args: {
		selectedDeliveryTiming: 'immediate',
		onChange: () => {},
		channel: 'email',
	},
};

// DeliveryAndTimingInfoPreview stories
type SendInfoPreviewPillType = StoryObj<typeof SendInfoPreviewPill>;

export const PreviewEmpty: SendInfoPreviewPillType = {
	render: () => <SendInfoPreviewPill />,
};

export const PreviewChannelOnly: SendInfoPreviewPillType = {
	render: () => <SendInfoPreviewPill channel="email" />,
};

export const PreviewDeliveryTimingOnly: SendInfoPreviewPillType = {
	render: () => <SendInfoPreviewPill deliveryTiming="immediate" />,
};

export const PreviewBoth: SendInfoPreviewPillType = {
	render: () => (
		<SendInfoPreviewPill channel="email" deliveryTiming="immediate" />
	),
};

export const PreviewAppAlert: SendInfoPreviewPillType = {
	render: () => (
		<SendInfoPreviewPill channel="push" deliveryTiming="immediate" />
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('App alert')).toBeVisible();
		await expect(canvas.getByText('Immediate send')).toBeVisible();
		await expect(
			canvas.getByRole('img', { name: 'App alert icon' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('img', { name: 'Immediate send icon' }),
		).toBeInTheDocument();
	},
};
