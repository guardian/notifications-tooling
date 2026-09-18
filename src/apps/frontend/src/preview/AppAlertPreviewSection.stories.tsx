import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, within } from 'storybook/test';
import { FALLBACK_TOPIC_TYPES } from '../segment/audience-fallbacks';
import { articleFixture } from '../testing/capi-fixtures';
import {
	completeAppAlertFormValues,
	populatedAppAlertComposerState,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import { AppAlertPreviewSection } from './AppAlertPreviewSection';

type StoryArgs = ComponentProps<typeof AppAlertPreviewSection> & {
	composerState: NotificationComposerState;
	includeThumbnail: boolean;
};

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Preview/AppAlertPreviewSection',
	component: AppAlertPreviewSection,
	render: function Render({ composerState, includeThumbnail, ...args }) {
		return useNotificationFormStory(
			<AppAlertPreviewSection {...args} />,
			composerState,
			{},
			'app-push',
			{ ...completeAppAlertFormValues, includeThumbnail },
		);
	},
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
		composerState: populatedAppAlertComposerState,
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
		await expect(
			canvas.getByText('Show article thumbnail image'),
		).toBeVisible();
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
		await expect(
			canvas.getByText(
				'App alert formats might differ across platforms and devices',
			),
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
		await expect(
			canvas.queryByText('Show article thumbnail image'),
		).not.toBeInTheDocument();
	},
};
