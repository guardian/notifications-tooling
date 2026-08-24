import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { DEFAULT_SEGMENTS } from './segment-options';
import { SegmentPicker } from './SegmentPicker';
import { SegmentPreviewPill } from './SegmentPreviewPill';

const meta = {
	title: 'Stand Frontend/SegmentPicker',
	component: SegmentPicker,
	args: {
		title: 'Audience segments',
		description: 'Choose the audience the email notification will be sent to',
		options: DEFAULT_SEGMENTS,
		onChange: () => {},
	},
	parameters: {
		docs: {
			description: {
				component:
					'SegmentPicker allows users to choose which audience segments or editions to send notifications to.',
			},
		},
	},
} satisfies Meta<typeof SegmentPicker>;

export default meta;
type Story = StoryObj<typeof meta>;
type SegmentPreviewPillStory = StoryObj<typeof SegmentPreviewPill>;

export const NoSelection: Story = {
	args: {
		selected: [],
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Audience segments')).toBeInTheDocument();
		await expect(canvas.getByText('United Kingdom')).toBeInTheDocument();
		await expect(canvas.getByText('United States')).toBeInTheDocument();
		await expect(canvas.getByText('Australia')).toBeInTheDocument();
	},
};

export const SingleSelection: Story = {
	args: {
		selected: ['UK'],
	},
};

export const MultipleSelection: Story = {
	args: {
		selected: ['UK', 'US'],
	},
};

export const AllSelected: Story = {
	args: {
		selected: ['UK', 'US', 'AU'],
	},
};

export const PreviewWithSingleSelection: SegmentPreviewPillStory = {
	render: () => (
		<SegmentPreviewPill
			title="Audience segments"
			options={DEFAULT_SEGMENTS}
			selected={['AU']}
		/>
	),
	args: {
		selected: ['AU'],
	},
};

export const PreviewWithMultipleSelection: SegmentPreviewPillStory = {
	render: () => (
		<SegmentPreviewPill
			title="Audience segments"
			options={DEFAULT_SEGMENTS}
			selected={['UK', 'US']}
		/>
	),
	args: {
		selected: ['UK', 'US'],
	},
};
