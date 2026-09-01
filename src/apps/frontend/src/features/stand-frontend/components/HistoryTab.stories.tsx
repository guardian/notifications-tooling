import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { notificationHistoryResponse } from '../../../mocks/api-fixtures';
import { HistoryTab } from './HistoryTab';

const meta = {
	title: 'Stand Frontend/HistoryTab',
	component: HistoryTab,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof HistoryTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { alerts: notificationHistoryResponse.alerts },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('grid', { name: 'Sent alerts' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', {
				name: 'Prime minister announces cabinet reshuffle',
			}),
		).toBeInTheDocument();
		await expect(canvas.getAllByText('Sent')).toHaveLength(4);
		await expect(canvas.getByText('Failed')).toBeInTheDocument();
		await expect(canvas.getByText('No image')).toBeInTheDocument();
		await expect(canvasElement.querySelectorAll('img')).toHaveLength(4);
		await expect(
			canvas.getAllByRole('img', { name: 'International' }),
		).toHaveLength(2);
	},
};

export const Empty: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('No alerts have been sent yet.'),
		).toBeInTheDocument();
	},
};
