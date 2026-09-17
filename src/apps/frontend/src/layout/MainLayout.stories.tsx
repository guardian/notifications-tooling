import { semanticSizing } from '@guardian/stand';
import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ConfigContext } from '../config/ConfigContext';
import { mockAppConfig } from '../testing/app-config';
import { stickyHeaderHeightProperty, topBarHeight } from '../themes';
import { MainLayout } from './MainLayout';

const meta = {
	title: 'Dispatch/Layout/MainLayout',
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
			<ConfigContext.Provider value={mockAppConfig}>
				<Story />
			</ConfigContext.Provider>
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
		const layout = canvasElement.firstElementChild;
		if (!layout) {
			throw new Error('Expected the main layout to be rendered');
		}

		await expect(
			canvas.getByText('Page content goes here'),
		).toBeInTheDocument();
		await expect(
			canvas.queryByText(/You are working in the Dispatch/),
		).not.toBeInTheDocument();
		await expect(
			getComputedStyle(layout).getPropertyValue(stickyHeaderHeightProperty),
		).toBe(topBarHeight);
		await expect(
			canvas.getByRole('link', { name: 'Create newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			canvas.getByRole('link', { name: 'Create app alert' }),
		).toHaveAttribute('href', '/app-alert/create');
	},
};

export const NonProductionEnvironment: Story = {
	render: (args) => (
		<ConfigContext.Provider value={{ ...mockAppConfig, stage: 'CODE' }}>
			<MainLayout {...args} />
		</ConfigContext.Provider>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const layout = canvasElement.firstElementChild;
		if (!layout) {
			throw new Error('Expected the main layout to be rendered');
		}

		await expect(
			canvas.getByText('You are working in the Dispatch CODE Environment'),
		).toBeInTheDocument();
		await expect(
			getComputedStyle(layout).getPropertyValue(stickyHeaderHeightProperty),
		).toBe(`calc(${topBarHeight} + ${semanticSizing.height.md})`);
	},
};
