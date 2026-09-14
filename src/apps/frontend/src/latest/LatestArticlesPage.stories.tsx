import type { CapiSearchResult } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { delay, http, HttpResponse } from 'msw';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { getApiBaseUrl } from '../api-client/config';
import { articleFixture } from '../testing/capi-fixtures';
import { LatestArticlesPage } from './LatestArticlesPage';

const response: CapiSearchResult = {
	status: 'ok',
	total: 2,
	startIndex: 1,
	pageSize: 10,
	currentPage: 1,
	pages: 1,
	orderBy: 'newest',
	results: [
		articleFixture,
		{
			...articleFixture,
			id: 'world/2026/sep/14/latest-world-news',
			sectionName: 'World news',
			webTitle: 'Latest world news',
			webUrl: 'https://www.theguardian.com/world/2026/sep/14/latest-world-news',
			webPublicationDate: '2026-09-14T10:00:00Z',
			fields: { headline: 'Latest world news' },
		},
	],
};

const latestArticlesHandler = http.get(
	`${getApiBaseUrl()}/v1/content/articles/latest`,
	() => HttpResponse.json(response),
);

const meta = {
	title: 'Dispatch/Latest articles/LatestArticlesPage',
	component: LatestArticlesPage,
	parameters: {
		layout: 'fullscreen',
		msw: { handlers: [latestArticlesHandler] },
	},
} satisfies Meta<typeof LatestArticlesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole('grid', { name: 'Latest published articles' }),
		).toBeVisible();
		await expect(canvas.getByText('World news')).toBeVisible();
		await expect(
			canvas.getByRole('link', { name: 'Latest world news' }),
		).toHaveAttribute(
			'href',
			'https://www.theguardian.com/world/2026/sep/14/latest-world-news',
		);

		const refreshButton = canvas.getByRole('button', {
			name: 'Refresh activity',
		});
		await userEvent.click(refreshButton);
		await waitFor(() => expect(refreshButton).toBeEnabled());
	},
};

export const Empty: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get(`${getApiBaseUrl()}/v1/content/articles/latest`, () =>
					HttpResponse.json({ ...response, total: 0, results: [] }),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByRole('heading', { name: 'No recent articles' }),
		).toBeVisible();
	},
};

export const Loading: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get(`${getApiBaseUrl()}/v1/content/articles/latest`, async () => {
					await delay('infinite');
					return HttpResponse.json(response);
				}),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('status', { name: 'Loading latest articles' }),
		).toHaveAttribute('aria-busy', 'true');
	},
};

export const Error: Story = {
	parameters: {
		msw: {
			handlers: [
				http.get(`${getApiBaseUrl()}/v1/content/articles/latest`, () =>
					HttpResponse.json({ error: 'capi_unavailable' }, { status: 502 }),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			await canvas.findByText('Unable to load the latest articles. Try again.'),
		).toBeVisible();
	},
};
