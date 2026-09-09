import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { getApiBaseUrl } from '../api-client/config';
import { ConfigContext } from '../config/ConfigContext';
import type { NotificationListResponse } from '../schemas';
import { mockAppConfig } from '../testing/app-config';
import { channelAudiencesHandler } from '../testing/handlers/channels';
import { DispatchLandingTab } from './DispatchLandingTab';
import { MainLayout } from './MainLayout';

type StoryArgs = {
	appConfig?: AppConfig;
};

const historyResponse: NotificationListResponse = {
	total: 0,
	limit: 20,
	offset: 0,
	notifications: [],
};

const historyHandler = http.get(`${getApiBaseUrl()}/v1/notifications`, () =>
	HttpResponse.json(historyResponse),
);

const meta = {
	title: 'Stand Frontend/DispatchLandingTab',
	component: DispatchLandingTab,
	parameters: {
		layout: 'fullscreen',
		msw: { handlers: [historyHandler, channelAudiencesHandler] },
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
			canvasElement.querySelector('a[href="/dispatch"]'),
		).toBeInTheDocument();
		await expect(
			await canvas.findByText('No alerts have been sent yet.'),
		).toBeInTheDocument();
		await expect(
			canvas.getByRole('link', { name: 'Create newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			canvas.getByRole('link', { name: 'Create app alert' }),
		).toHaveAttribute('href', '/app-alert/create');
	},
};
