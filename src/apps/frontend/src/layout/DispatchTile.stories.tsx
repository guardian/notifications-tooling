import { type ClickableTileProps, Tile } from '@guardian/stand/Tile';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { notificationRoutes } from '../routes';
import { phoneIphoneIcon } from '../ui/flag-icons';

type StoryArgs = Pick<ClickableTileProps, 'href' | 'icon'> & {
	title: string;
};

const meta = {
	title: 'Stand Frontend/DispatchLanding/Tile',
	component: Tile,
	args: {
		title: 'Create a newsletter email',
		icon: 'mail',
		href: notificationRoutes.newsletter.create,
	},
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Stand clickable tiles used for primary actions on the Dispatch landing page.',
			},
		},
	},
	render: ({ title, ...props }) => (
		<div style={{ width: '300px' }}>
			<Tile {...props} typography="headingMd">
				{title}
			</Tile>
		</div>
	),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Newsletter: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('link', { name: 'Create a newsletter email' }),
		).toHaveAttribute('href', notificationRoutes.newsletter.create);
	},
};

export const AppAlert: Story = {
	args: {
		title: 'Create an app alert',
		icon: phoneIphoneIcon,
		href: notificationRoutes['app-push'].create,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('link', { name: 'Create an app alert' }),
		).toHaveAttribute('href', notificationRoutes['app-push'].create);
	},
};

export const History: Story = {
	args: {
		title: 'History',
		icon: 'history',
		href: '/history',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByRole('link', { name: 'History' })).toHaveAttribute(
			'href',
			'/history',
		);
	},
};
