import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { EmailPreviewSection } from './EmailPreviewSection';

const meta = {
	title: 'Stand Frontend/EmailPreviewSection',
	component: EmailPreviewSection,
	args: {
		selectedSegments: [],
		selectedChannel: undefined,
		selectedDeliveryTiming: undefined,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Preview section showing selected channel, delivery timing, and audience segments.',
			},
		},
	},
} satisfies Meta<typeof EmailPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: {
		selectedSegments: [],
		selectedChannel: undefined,
		selectedDeliveryTiming: undefined,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Preview')).toBeInTheDocument();
		await expect(
			canvas.getByText(
				'The preview for the newsletter email and/or the app alert notification will be shown below.',
			),
		).toBeInTheDocument();
	},
};

export const WithChannel: Story = {
	args: {
		selectedSegments: [],
		selectedChannel: 'Newsletter email',
		selectedDeliveryTiming: undefined,
	},
};

export const WithDeliveryTiming: Story = {
	args: {
		selectedSegments: [],
		selectedChannel: undefined,
		selectedDeliveryTiming: 'Immediate',
	},
};

export const WithSegments: Story = {
	args: {
		selectedSegments: ['UK', 'US'],
		selectedChannel: undefined,
		selectedDeliveryTiming: undefined,
	},
};

export const FullyPopulated: Story = {
	args: {
		selectedSegments: ['UK', 'US', 'AU'],
		selectedChannel: 'Newsletter email',
		selectedDeliveryTiming: 'Immediate',
	},
};
