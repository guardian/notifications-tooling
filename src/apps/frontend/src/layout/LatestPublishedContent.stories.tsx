import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { createNotificationPrefillState } from '../compose/notification-prefill';
import { ConfigContext } from '../config/ConfigContext';
import { notificationRoutes } from '../routes';
import { mockAppConfig } from '../testing/app-config';
import { articleFixture } from '../testing/capi-fixtures';
import {
	getWindowHistoryState,
	getWindowRouterState,
} from '../testing/router-history';
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
	},
	render: ({ appConfig }: StoryArgs) => (
		<ConfigContext.Provider value={appConfig}>
			<LatestPublishedContent />
		</ConfigContext.Provider>
	),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	beforeEach: () => {
		const originalUrl = window.location.href;
		const originalState = getWindowHistoryState();

		return () => window.history.replaceState(originalState, '', originalUrl);
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
			await screen.findByRole('dialog', {
				name: 'Choose an alert type for this content',
			}),
		).toBeVisible();
		await expect(
			screen.getByRole('link', { name: 'Create a newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			screen.getByRole('link', { name: 'Create an app alert' }),
		).toHaveAttribute('href', notificationRoutes['app-push'].create);

		await userEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
		await waitFor(() =>
			expect(
				screen.queryByRole('dialog', {
					name: 'Choose an alert type for this content',
				}),
			).not.toBeInTheDocument(),
		);

		await userEvent.click(
			canvas.getByRole('button', {
				name: 'Open Latest Published Content',
			}),
		);
		await userEvent.click(
			await screen.findByRole('link', { name: 'Create an app alert' }),
		);
		await waitFor(async () => {
			await expect(window.location.pathname).toBe(
				notificationRoutes['app-push'].create,
			);
			await expect(window.location.search).toBe('');
			await expect(getWindowRouterState()).toEqual(
				createNotificationPrefillState('app-push', {
					articleUrl: articleFixture.webUrl,
				}),
			);
		});
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
