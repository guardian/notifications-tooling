import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type { completeNewsletterEmailFormValues } from '../testing/story-fixtures';
import { populatedNewsletterEmailComposerState } from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import { NewsletterEmailPreviewSection } from './NewsletterEmailPreviewSection';

type StoryArgs = {
	composerState: NotificationComposerState;
	formValues?: Partial<typeof completeNewsletterEmailFormValues>;
};

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Preview/NewsletterEmailPreviewSection',
	component: NewsletterEmailPreviewSection,
	args: {
		composerState: populatedNewsletterEmailComposerState,
	},
	render: function Render({ composerState, formValues }) {
		return useNotificationFormStory(
			<NewsletterEmailPreviewSection />,
			composerState,
			{},
			'newsletter',
			formValues,
		);
	},
	parameters: {
		docs: {
			description: {
				component:
					'Preview section showing selected channel, delivery timing, and audience segments.',
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Preview')).toBeVisible();
		await expect(
			canvas.getByText(
				'The preview for the newsletter email will be shown below.',
			),
		).toBeVisible();
		await expect(
			canvas.getByText(
				'Email appearance may vary across different email clients and devices',
			),
		).toBeVisible();
	},
};

export const WithChannel: Story = {};

export const WithDeliveryTiming: Story = {};

export const WithSegments: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
		formValues: { audienceSegments: ['UK', 'US'] },
	},
};

export const FullyPopulated: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
		formValues: { audienceSegments: ['UK', 'US', 'AU'] },
	},
};
