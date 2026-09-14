import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ClickableTile } from './ClickableTile';

const meta = {
	title: 'Stand Frontend/DispatchLanding/ClickableTile',
	component: ClickableTile,
	args: {
		title: 'Create a newsletter email',
		icon: 'mail',
		href: '/newsletter-email/create',
	},
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Dispatch landing action tile with icon/title in the top row and a forward arrow aligned to the bottom-right.',
			},
		},
	},
	render: (args) => (
		<div style={{ width: '300px' }}>
			<ClickableTile {...args} />
		</div>
	),
} satisfies Meta<typeof ClickableTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Newsletter: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('link', { name: 'Create a newsletter email' }),
		).toBeVisible();
		await expect(canvas.getByText('Create a newsletter email')).toBeVisible();
	},
};

export const AppAlert: Story = {
	args: {
		title: 'Create an app alert',
		icon: 'notifications',
		href: '/app-alert/create',
	},
};

export const History: Story = {
	args: {
		title: 'History',
		icon: 'history',
		href: '/history',
	},
};
