import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { mockRequestEmailHtml } from '../testing/mock-fetch-email';
import type { completeNewsletterEmailFormValues } from '../testing/story-fixtures';
import { populatedNewsletterEmailComposerState } from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState, RequestEmailHtml } from '../types';
import { NewsletterEmailPreviewSection } from './NewsletterEmailPreviewSection';

type StoryArgs = {
	composerState: NotificationComposerState;
	formValues?: Partial<typeof completeNewsletterEmailFormValues>;
	requestEmailHtml?: RequestEmailHtml;
};

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Preview/NewsletterEmailPreviewSection',
	component: NewsletterEmailPreviewSection,
	args: {
		composerState: populatedNewsletterEmailComposerState,
	},
	render: function Render({ composerState, formValues, requestEmailHtml }) {
		return useNotificationFormStory(
			<NewsletterEmailPreviewSection />,
			composerState,
			{ requestEmailHtml },
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

const requestedLiveblogUrl =
	'https://www.theguardian.com/world/live/2026/sep/04/latest-developments#block-6a9af4938f0834a1091dfae4';
const requestBlockEmailHtml = fn(mockRequestEmailHtml);

export const RequestedLiveblogBlock: Story = {
	args: {
		composerState: {
			...populatedNewsletterEmailComposerState,
			requestedUrl: requestedLiveblogUrl,
		},
		formValues: { audienceSegments: ['UK'] },
		requestEmailHtml: requestBlockEmailHtml,
	},
	play: async () => {
		await waitFor(() =>
			expect(requestBlockEmailHtml).toHaveBeenCalledWith({
				article: requestedLiveblogUrl,
				audience: ['UK'],
			}),
		);
	},
};
