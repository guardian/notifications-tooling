import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ConfigContext } from '../config/ConfigContext';
import { mockAppConfig } from '../testing/app-config';
import { LatestPublishedContent } from './LatestPublishedContent';

type StoryArgs = {
	appConfig?: AppConfig;
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
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);

		await userEvent.click(
			canvas.getByRole('button', {
				name: 'Click Open Latest Published Content',
			}),
		);

		await expect(
			await screen.findByRole('dialog', { name: 'Choose a notification type' }),
		).toBeVisible();
		await expect(
			screen.getByRole('link', { name: 'Create a newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');
		await expect(
			screen.getByRole('link', { name: 'Create an app alert' }),
		).toHaveAttribute('href', '/app-alert/create');

		await userEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
		await waitFor(() =>
			expect(
				screen.queryByRole('dialog', { name: 'Choose a notification type' }),
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
				name: 'Click Open Latest Published Content',
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
