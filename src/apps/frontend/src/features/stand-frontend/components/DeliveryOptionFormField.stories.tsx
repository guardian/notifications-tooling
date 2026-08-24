import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { DeliveryOptionFormField } from './DeliveryOptionFormField';

const meta = {
	title: 'Stand Frontend/Form Fields/DeliveryOptionFormField',
	component: DeliveryOptionFormField,
	args: {
		channel: 'email',
	},
	render: (args) =>
		WithNotificationContext(
			<DeliveryOptionFormField {...args} />,
			undefined,
			{},
			args.channel,
		),
} satisfies Meta<typeof DeliveryOptionFormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Newsletter: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			canvas.getByText('The newsletter email is sent immediately'),
		).toBeVisible();
		await expect(canvas.getByRole('button')).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		await expect(canvas.getByText('Sends right now via Braze')).toBeVisible();
	},
};

export const AppAlert: Story = {
	args: {
		channel: 'push',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(
			canvas.getByText('The app alert is sent immediately'),
		).toBeVisible();
		await expect(canvas.getByRole('button')).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		await expect(canvas.getByText('Sends right now')).toBeVisible();
	},
};
