import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import {
	populatedPushState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { FALLBACK_TOPIC_TYPES } from '../api/useChannelAudiences';
import { AppPreviewSection } from './AppPreviewSection';

const meta = {
	title: 'Stand Frontend/AppPreviewSection',
	component: AppPreviewSection,
	render: (args) =>
		WithNotificationContext(
			<AppPreviewSection {...args} />,
			populatedPushState,
		),
	parameters: {
		docs: {
			description: {
				component:
					'App alert preview populated from the imported article and current app-alert selections.',
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
		await expect(canvas.getAllByText('Breaking News')).toHaveLength(2);
		await expect(
			canvas.getAllByText(articleFixture.fields?.headline ?? ''),
		).toHaveLength(2);
		await expect(canvas.getByAltText('Article thumbnail')).toBeVisible();
		await expect(
			canvas.getByAltText('Android article thumbnail'),
		).toBeVisible();
	},
};
