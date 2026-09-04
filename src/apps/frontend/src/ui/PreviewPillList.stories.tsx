import { Icon } from '@guardian/stand/Icon';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { PreviewPillList } from './PreviewPillList';

const options = [
	{ id: 'uk', label: 'UK' },
	{ id: 'us', label: 'US' },
	{ id: 'international', label: 'International' },
];

const meta = {
	title: 'Stand Frontend/PreviewPillList',
	component: PreviewPillList,
	args: {
		title: 'Editions',
		options,
		selected: ['uk', 'international'],
	},
} satisfies Meta<typeof PreviewPillList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.getByText('Editions')).toBeVisible();
		await expect(canvas.getByText('UK')).toBeVisible();
		await expect(canvas.getByText('International')).toBeVisible();
		await expect(canvas.queryByText('US')).not.toBeInTheDocument();
	},
};

export const WithIcons: Story = {
	args: {
		renderIcon: () => <Icon symbol="public" />,
	},
};

export const Confirmation: Story = {
	args: {
		isConfirmation: true,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(canvas.queryByText('Editions')).not.toBeInTheDocument();
		await expect(canvas.getByText('UK')).toBeVisible();
		await expect(canvas.getByText('International')).toBeVisible();
	},
};

export const Empty: Story = {
	args: {
		selected: [],
	},
	play: async ({ canvasElement }) => {
		await expect(canvasElement).toBeEmptyDOMElement();
	},
};
