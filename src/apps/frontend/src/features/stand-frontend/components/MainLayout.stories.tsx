import { Layout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type { UserResponse } from '../get-user';
import { UserContext } from '../UserContext';
import { MainLayout } from './MainLayout';

const storyUser: UserResponse = {
	user: {
		firstName: 'John',
		lastName: 'Doe',
		email: 'j.doe@example.com',
		authenticatingSystem: '',
		authenticatedIn: [],
		expires: 0,
		multifactor: false
	},
	permissions: []
};

const meta = {
	title: 'Stand Frontend/MainLayout',
	component: MainLayout,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The reusable application shell (TopBar, navigation and user avatar), shown with placeholder content. The fully composed, interactive page is exercised by the "Notifications Page" story.',
			},
		},
	},
	decorators: [
		(Story) => (
			<UserContext.Provider value={storyUser}>
				<Story />
			</UserContext.Provider>
		),
	],
	args: {
		currentTab: 'create',
		setTab: () => {},
		children: (
			<Layout.Main>
				<Typography variant="bodyMd">Page content goes here</Typography>
			</Layout.Main>
		),
	},
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('Page content goes here'),
		).toBeInTheDocument();
	},
};
