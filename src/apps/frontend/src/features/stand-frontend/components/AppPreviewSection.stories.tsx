import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import {
	completePushParams,
	populatedPushState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { FALLBACK_TOPIC_TYPES } from '../api/useChannelAudiences';
import { defaultAppAlertState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { AppPreviewSection } from './AppPreviewSection';

type StoryArgs = ComponentProps<typeof AppPreviewSection> & {
	notificationState: NotificationState;
	includeThumbnail: boolean;
};

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/AppPreviewSection',
	component: AppPreviewSection,
	render: ({ notificationState, includeThumbnail, ...args }) =>
		WithNotificationContext(
			<AppPreviewSection {...args} />,
			notificationState,
			{},
			'push',
			{ ...completePushParams, includeThumbnail },
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
		notificationState: populatedPushState,
		includeThumbnail: true,
	},
};

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
		await expect(canvas.getByText('United Kingdom')).toBeVisible();
		await expect(canvas.getByText('International')).toBeVisible();
		await expect(canvas.queryByText('US')).not.toBeInTheDocument();
		await expect(canvas.queryByText('AU')).not.toBeInTheDocument();
		await expect(canvas.queryByText('Europe')).not.toBeInTheDocument();
		await expect(
			canvas.getByLabelText('iPhone notification preview'),
		).toBeVisible();
		await expect(
			canvas.getByLabelText('Android notification preview'),
		).toBeVisible();
		await expect(canvas.getAllByText('Breaking news')).toHaveLength(2);
		await expect(
			canvas.getAllByText(articleFixture.fields?.headline ?? ''),
		).toHaveLength(2);
		await expect(canvas.getByAltText('Article thumbnail')).toBeVisible();
		await expect(
			canvas.getByAltText('Android article thumbnail'),
		).toBeVisible();
	},
};

export const WithoutThumbnail: Story = {
	args: {
		includeThumbnail: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByLabelText('iPhone notification preview'),
		).toBeVisible();
		await expect(
			canvas.getByLabelText('Android notification preview'),
		).toBeVisible();
		await expect(
			canvas.queryByAltText('Article thumbnail'),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByAltText('Android article thumbnail'),
		).not.toBeInTheDocument();
	},
};

export const BeforeArticleImport: Story = {
	args: {
		notificationState: defaultAppAlertState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('The preview for the app alert will be shown below.'),
		).not.toBeVisible();
	},
};
