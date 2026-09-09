import { baseColors } from '@guardian/stand';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tooltip } from './Tooltip';

const meta = {
	title: 'Stand Frontend/Tooltip',
	component: Tooltip,
	args: {
		label: 'More information',
		children: 'Notifications are sent to every subscribed user.',
	},
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'More information' });

		await expect(
			canvas.queryByText('Notifications are sent to every subscribed user.'),
		).not.toBeInTheDocument();

		await userEvent.click(trigger);

		await waitFor(async () => {
			await expect(
				within(document.body).getByText(
					'Notifications are sent to every subscribed user.',
				),
			).toBeVisible();
		});
	},
};

export const CustomIcon: Story = {
	args: {
		label: 'Scheduling help',
		symbol: 'schedule',
		iconSize: 'md',
	},
};

export const Themed: Story = {
	args: {
		placement: 'bottom',
		theme: {
			backgroundColor: baseColors.magenta[800],
			triggerColor: baseColors.magenta[800],
		},
	},
};
