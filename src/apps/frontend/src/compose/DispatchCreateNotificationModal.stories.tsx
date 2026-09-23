import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ConfigContext } from '../config/ConfigContext';
import { mockAppConfig } from '../testing/app-config';
import { DispatchCreateNotificationModal } from './DispatchCreateNotificationModal';

type StoryArgs = ComponentProps<typeof DispatchCreateNotificationModal> & {
	appConfig: AppConfig;
};

const meta = {
	title: 'Dispatch/Compose/DispatchCreateNotificationModal',
	component: DispatchCreateNotificationModal,
	parameters: { layout: 'centered' },
	args: {
		appConfig: mockAppConfig,
		isOpen: true,
		onOpenChange: fn(),
	},
	render: ({ appConfig, ...args }) => (
		<ConfigContext.Provider value={appConfig}>
			<DispatchCreateNotificationModal {...args} />
		</ConfigContext.Provider>
	),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByRole('dialog', {
				name: 'Choose an alert type for this content',
			}),
		).toBeVisible();
		await expect(
			screen.getByRole('link', { name: 'Create an app alert' }),
		).toHaveAttribute('href', '/app-alert/create');
		await expect(
			screen.getByRole('link', { name: 'Create a newsletter email' }),
		).toHaveAttribute('href', '/newsletter-email/create');

		await userEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
		await expect(args.onOpenChange).toHaveBeenCalledWith(false);
	},
};

export const AppAlertDisabled: Story = {
	args: {
		appConfig: { ...mockAppConfig, DISABLE_APP_SEND_TAB: true },
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByRole('link', { name: 'Create a newsletter email' }),
		).toBeVisible();
		await expect(
			screen.queryByRole('link', { name: 'Create an app alert' }),
		).not.toBeInTheDocument();
	},
};
