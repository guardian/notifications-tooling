import type { Meta, StoryObj } from '@storybook/react-vite';
import { PreviousNotificationsBar } from './PreviousNotificationsBar';

const meta = {
	title: 'Dispatch/Compose/PreviousNotificationsBar',
	component: PreviousNotificationsBar,
	args: {
		articleId: 'global/2016/march/01/some-article',
		showImportedArticle: true,
	},
} satisfies Meta<typeof PreviousNotificationsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
