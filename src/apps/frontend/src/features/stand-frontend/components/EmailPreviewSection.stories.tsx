import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { EmailPreviewSection } from './EmailPreviewSection';

const meta = {
	title: 'Stand Frontend/EmailPreviewSection',
	component: EmailPreviewSection,
	parameters: {
		docs: {
			description: {
				component:
					'This is a non-functional placeholder to demonstrate how content will appear in the layout.',
			},
		},
	},
} satisfies Meta<typeof EmailPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
