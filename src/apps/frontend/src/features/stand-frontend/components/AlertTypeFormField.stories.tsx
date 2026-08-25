import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { defaultAppAlertState } from '../notification-reducer';
import { AlertTypeFormField } from './AlertTypeFormField';

const meta = {
	title: 'Stand Frontend/Form Fields/AlertTypeFormField',
	component: AlertTypeFormField,
	render: () =>
		WithNotificationContext(
			<AlertTypeFormField />,
			defaultAppAlertState,
			{},
			'push',
		),
} satisfies Meta<typeof AlertTypeFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UpdatesSelection: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);
		const alertType = canvas.getByRole('button', {
			name: 'Breaking News Alert type',
		});

		await userEvent.click(alertType);
		await userEvent.click(screen.getByRole('option', { name: 'Sport' }));

		await expect(
			canvas.getByRole('button', { name: 'Sport Alert type' }),
		).toBeVisible();
	},
};
