import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, userEvent, within } from 'storybook/test';
import { latestPublishedContentQueryKey } from '../hooks/useLatestPublishedContent';
import { notificationRoutes, withArticleUrl } from '../routes';
import { mockLatestPublishedContent } from './latest-published-content';
import { LatestPublishedContentPanel } from './LatestPublishedContentPanel';

const emptyQueryKey = [...latestPublishedContentQueryKey, 'empty'] as const;
const errorQueryKey = [...latestPublishedContentQueryKey, 'error'] as const;
const loadingQueryKey = [...latestPublishedContentQueryKey, 'loading'] as const;

const DefaultPanelStory = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Infinity },
		},
	});
	queryClient.setQueryData(
		latestPublishedContentQueryKey,
		mockLatestPublishedContent,
	);

	return (
		<QueryClientProvider client={queryClient}>
			<div style={{ width: '380px' }}>
				<LatestPublishedContentPanel />
			</div>
		</QueryClientProvider>
	);
};

const EmptyPanelStory = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: Infinity },
		},
	});
	queryClient.setQueryData(emptyQueryKey, []);

	return (
		<QueryClientProvider client={queryClient}>
			<div style={{ width: '380px' }}>
				<LatestPublishedContentPanel queryKey={emptyQueryKey} />
			</div>
		</QueryClientProvider>
	);
};

const ErrorPanelStory = () => (
	<div style={{ width: '380px' }}>
		<LatestPublishedContentPanel
			queryKey={errorQueryKey}
			queryFn={() =>
				Promise.reject(new globalThis.Error('content unavailable'))
			}
		/>
	</div>
);

const LoadingPanelStory = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

	return (
		<QueryClientProvider client={queryClient}>
			<div style={{ width: '380px' }}>
				<LatestPublishedContentPanel
					queryKey={loadingQueryKey}
					queryFn={() => new Promise(() => undefined)}
				/>
			</div>
		</QueryClientProvider>
	);
};

const meta = {
	title: 'Dispatch/LatestContent/LatestPublishedContentPanel',
	component: LatestPublishedContentPanel,
	parameters: {
		layout: 'centered',
	},
	render: () => <DefaultPanelStory />,
} satisfies Meta<typeof LatestPublishedContentPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Latest published content' }),
		).toBeVisible();
		await expect(
			canvas.getByText('Choose a recent article from below to create an alert'),
		).toBeVisible();
		const showAllButton = await canvas.findByRole('button', {
			name: 'Show all',
		});
		await expect(
			canvas.getAllByRole('button', { name: /create/i }),
		).toHaveLength(3);
		await userEvent.click(
			canvas.getAllByRole('button', { name: /create/i })[0]!,
		);
		const documentCanvas = within(canvasElement.ownerDocument.body);
		await expect(
			await documentCanvas.findByRole('dialog', {
				name: 'Choose an alert type for this content',
			}),
		).toBeVisible();
		await expect(
			documentCanvas.getByRole('link', { name: 'Create a newsletter email' }),
		).toHaveAttribute(
			'href',
			withArticleUrl(
				notificationRoutes.newsletter.create,
				mockLatestPublishedContent[0]!.url,
			),
		);
		await expect(
			documentCanvas.getByRole('link', { name: 'Create an app alert' }),
		).toHaveAttribute(
			'href',
			withArticleUrl(
				notificationRoutes['app-push'].create,
				mockLatestPublishedContent[0]!.url,
			),
		);
		await userEvent.click(
			documentCanvas.getByRole('button', { name: 'Close Modal' }),
		);
		await userEvent.click(showAllButton);
		await expect(showAllButton).not.toBeInTheDocument();
		await expect(
			await canvas.findAllByRole('button', { name: /create/i }),
		).toHaveLength(6);
	},
};

export const Empty: Story = {
	render: () => <EmptyPanelStory />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Latest published content' }),
		).toBeVisible();
		await expect(
			canvas.getByRole('heading', { name: 'No published content yet' }),
		).toBeVisible();
		await expect(
			canvas.getByText('Published articles will appear here.'),
		).toBeVisible();
		await expect(
			canvas.queryByRole('grid', { name: 'Latest published content' }),
		).not.toBeInTheDocument();
	},
};

export const Error: Story = {
	render: () => <ErrorPanelStory />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Latest published content' }),
		).toBeVisible();
		await expect(
			await canvas.findByText(
				'Unable to load latest published content. Try again.',
			),
		).toBeVisible();
		await expect(
			canvas.queryByRole('heading', { name: 'No published content yet' }),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByRole('grid', { name: 'Latest published content' }),
		).not.toBeInTheDocument();
	},
};

export const Loading: Story = {
	render: () => <LoadingPanelStory />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('status', {
				name: 'Loading latest published content',
			}),
		).toHaveAttribute('aria-busy', 'true');
		await expect(
			canvas.queryByRole('grid', { name: 'Latest published content' }),
		).not.toBeInTheDocument();
	},
};
