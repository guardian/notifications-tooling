import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ConfigContext } from '../config/ConfigContext';
import { mockAppConfig } from '../testing/app-config';
import { DispatchLandingTab } from './DispatchLandingTab';
import { MainLayout } from './MainLayout';

type StoryArgs = {
	appConfig?: AppConfig;
};

const meta = {
	title: 'Stand Frontend/DispatchLandingTab',
	component: DispatchLandingTab,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Landing page for Dispatch, displayed when users click the Dispatch title in the top navigation.',
			},
		},
	},
	args: {
		appConfig: mockAppConfig,
	},
	render: ({ appConfig }: StoryArgs) => (
		<ConfigContext.Provider value={appConfig}>
			<MainLayout>
				<DispatchLandingTab />
			</MainLayout>
		</ConfigContext.Provider>
	),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Dispatch Landing Page' }),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', { name: 'Dispatch' }),
		).toHaveAttribute('href', '/dispatch');
		await expect(
			canvas.getByRole('link', { name: 'Create newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			canvas.getByRole('link', { name: 'Create app alert' }),
		).toHaveAttribute('href', '/app-alert/create');
	},
};
