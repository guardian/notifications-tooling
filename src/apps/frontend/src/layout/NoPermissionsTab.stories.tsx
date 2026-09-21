import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { NoPermissionsTab } from './NoPermissionsTab';

const meta = {
	title: 'Dispatch/Layout/NoPermissionsTab',
	component: NoPermissionsTab,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NoPermissionsTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Unauthorised' }),
		).toBeVisible();
		await expect(
			canvas.getByRole('link', { name: 'contact central production' }),
		).toHaveAttribute('href', 'mailto:central.production@guardian.co.uk');
	},
};
