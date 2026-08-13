import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { mockAppConfig } from '../../../mocks/app-config';
import { UserContext } from '../UserContext';
import { MainLayout } from './MainLayout';

const meta = {
	title: 'Stand Frontend/MainLayout',
	component: MainLayout,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The reusable application shell (TopBar, navigation and user avatar), shown with placeholder content. The fully composed, interactive page is exercised by the "Notifications Page" story.',
			},
		},
	},
	decorators: [
		(Story) => (
			<UserContext.Provider value={mockAppConfig}>
				<Story />
			</UserContext.Provider>
		),
	],
	args: {
		children: (
			<Layout.Main>
				<Typography variant="bodyMd">Page content goes here</Typography>
			</Layout.Main>
		),
	},
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('Page content goes here'),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', { name: 'Create newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			canvas.getByRole('link', { name: 'Create app alert' }),
		).toHaveAttribute('href', '/app-alert/create');
	},
};
