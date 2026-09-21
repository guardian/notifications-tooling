import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ConfigContext } from '../config/ConfigContext';
import { notificationRoutes, withArticleUrl } from '../routes';
import { mockAppConfig } from '../testing/app-config';
import { articleFixture } from '../testing/capi-fixtures';
import { LatestPublishedContent } from './LatestPublishedContent';

type StoryArgs = {
	appConfig?: AppConfig;
	articleUrl?: string;
};

const meta = {
	title: 'Dispatch/Layout/LatestPublishedContent',
	component: LatestPublishedContent,
	args: {
		appConfig: mockAppConfig,
		articleUrl: articleFixture.webUrl,
	},
	render: ({ appConfig, articleUrl }: StoryArgs) => (
		<ConfigContext.Provider value={appConfig}>
			<LatestPublishedContent articleUrl={articleUrl} />
		</ConfigContext.Provider>
	),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);

		await userEvent.click(
			canvas.getByRole('button', {
				name: 'Open Latest Published Content',
			}),
		);

		await expect(
			await screen.findByRole('dialog', {
				name: 'Choose an alert type for this content',
			}),
		).toBeVisible();
		await expect(
			screen.getByRole('link', { name: 'Create a newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			screen.getByRole('link', { name: 'Create an app alert' }),
		).toHaveAttribute(
			'href',
			withArticleUrl(
				notificationRoutes['app-push'].create,
				articleFixture.webUrl,
			),
		);

		await userEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
		await waitFor(() =>
			expect(
				screen.queryByRole('dialog', {
					name: 'Choose an alert type for this content',
				}),
			).not.toBeInTheDocument(),
		);
	},
};

export const AppAlertDisabled: Story = {
	args: {
		appConfig: { ...mockAppConfig, DISABLE_APP_SEND_TAB: true },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);

		await userEvent.click(
			canvas.getByRole('button', {
				name: 'Open Latest Published Content',
			}),
		);

		await expect(
			await screen.findByRole('link', { name: 'Create a newsletter email' }),
		).toBeVisible();
		await expect(
			screen.queryByRole('link', { name: 'Create an app alert' }),
		).not.toBeInTheDocument();
	},
};
