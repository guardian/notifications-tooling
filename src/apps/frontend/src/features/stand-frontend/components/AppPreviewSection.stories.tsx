import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import { AppPreviewSection } from './AppPreviewSection';

const meta = {
	title: 'Stand Frontend/AppPreviewSection',
	component: AppPreviewSection,
	render: () =>
		WithNotificationContext(<AppPreviewSection />, {
			...defaultState,
			fetchedArticleId: 'article-id',
		}),
	parameters: {
		docs: {
			description: {
				component:
					'App alert preview composition. Device-specific preview content will be added here.',
			},
		},
	},
} satisfies Meta<typeof AppPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Preview')).toBeVisible();
		await expect(
			canvas.getByText(
				'The preview for the newsletter email and/or the app alert notification will be shown below.',
			),
		).toBeVisible();
	},
};
