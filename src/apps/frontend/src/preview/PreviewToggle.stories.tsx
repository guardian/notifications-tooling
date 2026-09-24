import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FALLBACK_TOPIC_TYPES } from '../segment/audience-fallbacks';
import {
	completeAppAlertFormValues,
	completeNewsletterEmailFormValues,
	populatedAppAlertComposerState,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import { defaultComposerState } from '../utils/notification-composer-reducer';
import {
	AppAlertPreviewToggle,
	NewsletterEmailPreviewToggle,
} from './PreviewToggle';

type StoryArgs = {
	composerState: NotificationComposerState;
};

type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Preview/PreviewToggle',
	component: NewsletterEmailPreviewToggle,
	args: {
		composerState: defaultComposerState,
	},
	render: function Render({ composerState }) {
		return useNotificationFormStory(
			<NewsletterEmailPreviewToggle />,
			composerState,
		);
	},
};

export default meta;

export const Collapsed: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Preview' });
		await expect(toggle).toHaveAttribute('aria-controls');
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	},
};

export const Expanded: Story = {
	args: {
		composerState: {
			...defaultComposerState,
		},
	},
	render: function Render({ composerState }) {
		return useNotificationFormStory(
			<NewsletterEmailPreviewToggle />,
			composerState,
			{},
			'newsletter',
			completeNewsletterEmailFormValues,
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Preview' });

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		const contentId = toggle.getAttribute('aria-controls');
		if (!contentId) {
			throw new globalThis.Error('Preview content ID not found');
		}
		await expect(
			canvasElement.ownerDocument.getElementById(contentId),
		).toBeVisible();
		await expect(
			canvas.getByText(
				'The preview for the newsletter email will be shown below.',
			),
		).toBeInTheDocument();
	},
};

export const AppAlertExpanded: Story = {
	args: {
		composerState: populatedAppAlertComposerState,
	},
	render: function Render({ composerState }) {
		return useNotificationFormStory(
			<AppAlertPreviewToggle topicTypes={FALLBACK_TOPIC_TYPES} />,
			composerState,
			{},
			'app-push',
			completeAppAlertFormValues,
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Preview' });

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-expanded', 'true');
		await expect(
			canvas.getByText('The preview for the app alert will be shown below.'),
		).toBeInTheDocument();
	},
};
