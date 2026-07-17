import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, within } from 'storybook/test';

import { Page } from './Page';

const meta = {
	title: 'Notifications Page',
	component: Page,
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const HelloWorld = canvas.getByText('Hello World', { selector: 'p' });
		await expect(HelloWorld).toBeInTheDocument();
	},
};
