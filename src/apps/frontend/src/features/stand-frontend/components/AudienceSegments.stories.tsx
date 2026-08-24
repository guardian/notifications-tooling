import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { FALLBACK_NEWSLETTER_EDITIONS } from '../api/useChannelAudiences';
import {
	AudienceSegments,
	AudienceSegmentsPreviewPill,
} from './AudienceSegments';

const meta = {
	title: 'Stand Frontend/AudienceSegments',
	component: AudienceSegments,
	args: {
		segments: FALLBACK_NEWSLETTER_EDITIONS,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Audience segment allows users to choose which audience to send notifications to.',
			},
		},
	},
} satisfies Meta<typeof AudienceSegments>;

export default meta;
type Story = StoryObj<typeof meta>;
type AudienceSegmentsPreviewPillStory = StoryObj<
	typeof AudienceSegmentsPreviewPill
>;

export const NoSelection: Story = {
	args: {
		selected: [],
		onChange: () => {},
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
		onChange: () => {},
	},
};

export const MultipleSelection: Story = {
	args: {
		selected: ['UK', 'US'],
		onChange: () => {},
	},
};

export const AllSelected: Story = {
	args: {
		selected: ['UK', 'US', 'AU'],
		onChange: () => {},
	},
};

export const PreviewWithSingleSelection: AudienceSegmentsPreviewPillStory = {
	render: (args) => <AudienceSegmentsPreviewPill {...args} selected={['AU']} />,
	args: {
		selected: ['AU'],
	},
};

export const PreviewWithMultipleSelection: AudienceSegmentsPreviewPillStory = {
	render: (args) => (
		<AudienceSegmentsPreviewPill {...args} selected={['UK', 'US']} />
	),
	args: {
		selected: ['UK', 'US'],
	},
};
