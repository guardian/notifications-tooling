import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { getApiBaseUrl } from '../api-client/config';
import { ConfigContext } from '../config/ConfigContext';
import { mockLatestPublishedContent } from '../latest-content/latest-published-content';
import { MainLayout } from '../layout/MainLayout';
import { notificationRoutes, withArticleUrl } from '../routes';
import type { NotificationListResponse } from '../schemas';
import { mockAppConfig } from '../testing/app-config';
import { channelAudiencesHandler } from '../testing/handlers/channels';
import { DispatchLandingPage } from './DispatchLandingPage';

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

const latestPublishedContentHandler = http.get(
	`${getApiBaseUrl()}/v1/content/articles/latest`,
	() =>
		HttpResponse.json({
			articles: mockLatestPublishedContent.map((item) => ({
				id: item.id,
				webUrl: item.url,
				publishedAt: item.publishedAt,
				headline: item.headline,
				section: item.section,
				pillarId: item.pillarId,
				pillarName: item.pillarName,
				thumbnail: item.imageUrl,
				intendedAudience: item.tags.flatMap(({ path }) =>
					path ? [path.replace('tracking/audience/', '')] : [],
				),
			})),
		}),
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
	title: 'Dispatch/Layout/DispatchLandingPage',
	component: DispatchLandingPage,
	parameters: {
		layout: 'fullscreen',
		msw: {
			handlers: [
				historyHandler,
				channelAudiencesHandler,
				latestPublishedContentHandler,
			],
		},
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
				<DispatchLandingPage />
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
			await canvas.findByRole('heading', { name: 'No alerts yet' }),
		).toBeInTheDocument();
		await expect(
			canvas.queryByRole('grid', { name: 'Sent alerts' }),
		).not.toBeInTheDocument();
		const refreshButton = canvas.getByRole('button', {
			name: 'Refresh activity',
		});
		const activitySummary = canvas.getByRole('group', {
			name: 'Activity summary',
		});
		await expect(
			within(activitySummary).getByText('Newsletter email'),
		).toBeInTheDocument();
		await expect(
			within(activitySummary).getByText('App alert'),
		).toBeInTheDocument();
		await expect(
			within(activitySummary).getByText('Last updated:'),
		).toBeInTheDocument();
		await expect(within(activitySummary).getByRole('button')).toBe(
			refreshButton,
		);
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
		const landingMain = canvas
			.getByRole('heading', { name: 'Welcome to Dispatch' })
			.closest('main');
		const latestPublishedContentRail = canvas
			.getByRole('heading', { name: 'Latest published content' })
			.closest('aside');
		if (!landingMain) {
			throw new Error('Expected the Dispatch landing main to be rendered');
		}
		if (!latestPublishedContentRail) {
			throw new Error('Expected latest published content rail to be rendered');
		}
		await expect(
			within(latestPublishedContentRail).getByText('Last updated:'),
		).toBeInTheDocument();
		await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(
			canvasElement.clientWidth,
		);
		await expect(
			latestPublishedContentRail.getBoundingClientRect().left,
		).toBeGreaterThanOrEqual(landingMain.getBoundingClientRect().right);

		await userEvent.click(
			canvas.getAllByRole('button', { name: 'Create' })[0]!,
		);
		const dialog = await within(canvasElement.ownerDocument.body).findByRole(
			'dialog',
			{ name: 'Choose an alert type for this content' },
		);
		await expect(
			within(dialog).getByRole('link', { name: 'Create a newsletter email' }),
		).toHaveAttribute(
			'href',
			withArticleUrl(
				notificationRoutes.newsletter.create,
				mockLatestPublishedContent[0]!.url,
			),
		);
		await expect(
			within(dialog).getByRole('link', { name: 'Create an app alert' }),
		).toHaveAttribute(
			'href',
			withArticleUrl(
				notificationRoutes['app-push'].create,
				mockLatestPublishedContent[0]!.url,
			),
		);
	},
};

export const Production: Story = {
	args: {
		appConfig: { ...mockAppConfig, stage: 'PROD' },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Welcome to Dispatch' }),
		).toBeInTheDocument();
		await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(
			canvasElement.clientWidth,
		);
	},
};

export const RecentOnly: Story = {
	parameters: {
		msw: {
			handlers: [
				sinceAwareHistoryHandler,
				channelAudiencesHandler,
				latestPublishedContentHandler,
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole('link', { name: /Recent dispatch record/ }),
		).toBeInTheDocument();
		await expect(
			canvas.queryByRole('link', { name: /Older dispatch record/ }),
		).not.toBeInTheDocument();
	},
};
