import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { FALLBACK_TOPIC_TYPES } from '../api/useChannelAudiences';
import { defaultState } from '../notification-reducer';
import { AppPreviewSection } from './AppPreviewSection';

const meta = {
	title: 'Stand Frontend/AppPreviewSection',
	component: AppPreviewSection,
	render: (args) =>
		WithNotificationContext(<AppPreviewSection {...args} />, {
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
	args: {
		topicTypes: FALLBACK_TOPIC_TYPES,
		selectedTopics: [
			{ type: 'breaking-news', name: 'uk' },
			{ type: 'breaking-news', name: 'international' },
		],
	},
} satisfies Meta<typeof AppPreviewSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Preview')).toBeVisible();
		await expect(
			canvas.getByText('The preview for the app alert will be shown below.'),
		).toBeVisible();
		await expect(canvas.getByText('Send info')).toBeVisible();
		await expect(canvas.getByText('App alert')).toBeVisible();
		await expect(canvas.getByText('Immediate send')).toBeVisible();
		await expect(canvas.getByText('Editions')).toBeVisible();
		await expect(canvas.getByText('UK')).toBeVisible();
		await expect(canvas.getByText('International')).toBeVisible();
		await expect(
			canvas.getByLabelText('iPhone notification preview'),
		).toBeVisible();
		await expect(
			canvas.getByLabelText('Android notification preview'),
		).toBeVisible();
		await expect(canvas.getAllByText('Breaking news')).toHaveLength(2);
		await expect(canvas.getByAltText('Article thumbnail')).toBeVisible();
		await expect(
			canvas.getByAltText('Android article thumbnail'),
		).toBeVisible();
	},
};
