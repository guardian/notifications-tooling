import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
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

const historyRequest = fn();
const historyHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	async () => {
		historyRequest();
		await delay(300);
		return HttpResponse.json(historyResponse);
	},
);

const now = Date.now();
const mixedHistoryResponse: NotificationListResponse = {
	total: 2,
	limit: 20,
	offset: 0,
	notifications: [
		{
			id: 'recent-dispatch-id',
			idempotencyKey: 'recent-dispatch',
			kind: 'send',
			status: 'delivered',
			sender: 'notifications-tooling-spa/v1',
			createdByEmail: 'editor@example.com',
			dryRun: false,
			scheduledFor: null,
			content: {
				items: {
					'lead-story': {
						type: 'app-push',
						title: 'Breaking news',
						body: 'Recent dispatch record',
						link: 'https://www.theguardian.com/recent-story',
					},
				},
			},
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'lead-story' },
				},
			},
			createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
		},
		{
			id: 'older-dispatch-id',
			idempotencyKey: 'older-dispatch',
			kind: 'send',
			status: 'delivered',
			sender: 'notifications-tooling-spa/v1',
			createdByEmail: 'editor@example.com',
			dryRun: false,
			scheduledFor: null,
			content: {
				items: {
					'lead-story': {
						type: 'app-push',
						title: 'Breaking news',
						body: 'Older dispatch record',
						link: 'https://www.theguardian.com/older-story',
					},
				},
			},
			channels: {
				'app-push': {
					audience: {
						type: 'topic',
						items: [{ type: 'breaking-news', name: 'uk' }],
					},
					compose: { use: 'lead-story' },
				},
			},
			createdAt: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
			updatedAt: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
		},
	],
};

const sinceAwareHistoryHandler = http.get(
	`${getApiBaseUrl()}/v1/notifications`,
	({ request }) => {
		const url = new URL(request.url);
		const sinceParam = url.searchParams.get('since');
		const sinceMilliseconds = sinceParam
			? Number(sinceParam) * 1000
			: undefined;
		const notifications = mixedHistoryResponse.notifications.filter(
			({ createdAt }) =>
				sinceMilliseconds === undefined ||
				new Date(createdAt).getTime() >= sinceMilliseconds,
		);

		return HttpResponse.json({
			total: notifications.length,
			limit: Number(url.searchParams.get('limit') ?? 20),
			offset: Number(url.searchParams.get('offset') ?? 0),
			notifications,
		});
	},
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
			canvas.getByRole('heading', { name: 'Welcome to Dispatch' }),
		).toBeInTheDocument();
		await expect(
			await canvas.findByText('No alerts have been sent yet.'),
		).toBeInTheDocument();
		await expect(canvas.getByText('Last updated:')).toBeInTheDocument();
		const refreshButton = canvas.getByRole('button', {
			name: 'Refresh activity',
		});
		await expect(
			refreshButton.compareDocumentPosition(
				canvas.getByRole('grid', { name: 'Sent alerts' }),
			) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		historyRequest.mockClear();
		await userEvent.click(refreshButton);
		await waitFor(async () => {
			await expect(historyRequest).toHaveBeenCalledOnce();
			await expect(refreshButton).toBeDisabled();
		});
		await waitFor(async () => {
			await expect(refreshButton).toBeEnabled();
		});
		await expect(
			canvas.getByRole('link', { name: 'Create newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			canvas.getByRole('link', { name: 'Create app alert' }),
		).toHaveAttribute('href', '/app-alert/create');
	},
};

export const RecentOnly: Story = {
	parameters: {
		msw: { handlers: [sinceAwareHistoryHandler, channelAudiencesHandler] },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole('link', { name: 'Recent dispatch record' }),
		).toBeInTheDocument();
		await expect(
			canvas.queryByRole('link', { name: 'Older dispatch record' }),
		).not.toBeInTheDocument();
	},
};
