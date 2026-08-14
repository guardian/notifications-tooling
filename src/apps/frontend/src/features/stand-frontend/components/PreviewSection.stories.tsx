import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { PreviewSection } from './PreviewSection';

const meta = {
	title: 'Stand Frontend/PreviewSection',
	component: PreviewSection,
	args: {
		title: 'Preview',
		description: 'A configurable preview description.',
		isVisible: true,
		children: <div>Preview content</div>,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Shared responsive shell for domain-specific email and app preview content.',
			},
		},
	},
} satisfies Meta<typeof PreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Preview')).toBeVisible();
		await expect(
			canvas.getByText('A configurable preview description.'),
		).toBeVisible();
		await expect(canvas.getByText('Preview content')).toBeVisible();
	},
};

export const Hidden: Story = {
	args: {
		isVisible: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Preview content')).not.toBeVisible();
	},
};
