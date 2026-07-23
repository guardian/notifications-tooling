import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ChannelSelector } from './ChannelSelector';

const meta = {
	title: 'Stand Frontend/ChannelSelector',
	component: ChannelSelector,
	parameters: {
		docs: {
			description: {
				component:
					'Channel selection tile. Users can click to select or deselect the newsletter email channel.',
			},
		},
	},
} satisfies Meta<typeof ChannelSelector>;

export default meta;
type SelectorStory = StoryObj<typeof meta>;

export const Unselected: SelectorStory = {
	args: {
		selectedChannel: undefined,
		onChange: () => {},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Channel')).toBeInTheDocument();
		await expect(canvas.getByText('Newsletter email')).toBeInTheDocument();
		await expect(
			canvas.getByText('Sends via the Braze breaking-news campaign'),
		).toBeInTheDocument();
	},
};

export const Selected: SelectorStory = {
	args: {
		selectedChannel: 'Newsletter email',
		onChange: () => {},
	},
};
