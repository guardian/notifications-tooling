import type { Meta, StoryObj } from '@storybook/react-vite';
import { useFormContext } from 'react-hook-form';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { PreviewTextFormField } from '../compose/PreviewTextFormField';
import { mockRequestEmailHtml } from '../testing/mock-fetch-email';
import { mockRequestTestEmailSend } from '../testing/mock-request-test-email-send';
import { completeNewsletterEmailFormValues } from '../testing/story-fixtures';
import { populatedNewsletterEmailComposerState } from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState, RequestEmailHtml } from '../types';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
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

const PreviewTextToggleHarness = () => {
	const { watch, setValue } = useFormContext<NewsletterEmailFormValues>();
	return (
		<>
			<PreviewTextFormField
				showPreview={watch('showPreview')}
				onTogglePreview={(showPreview) =>
					setValue('showPreview', showPreview, { shouldValidate: true })
				}
			/>
			<NewsletterEmailPreviewSection />
		</>
	);
};

const requestPreviewTextTestEmail = fn(mockRequestTestEmailSend);

export const PreviewTextToggleUpdatesHtmlAndTestEmail: Story = {
	render: function Render({ composerState }) {
		return useNotificationFormStory(
			<PreviewTextToggleHarness />,
			composerState,
			{ requestTestEmailSend: requestPreviewTextTestEmail },
			'newsletter',
			{
				...completeNewsletterEmailFormValues,
				previewText: 'Saved preview text',
			},
		);
	},
	play: async ({ canvasElement }) => {
		requestPreviewTextTestEmail.mockClear();
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', { name: 'Show preview text' });
		const previewArticleElement = canvasElement.querySelector('figure article');

		const previewBodyText = () =>
			previewArticleElement?.querySelector('h2 ~ div')?.textContent;

		await waitFor(() => expect(previewBodyText()).toBe('Saved preview text'));
		await userEvent.type(
			canvas.getByPlaceholderText('name@theguardian.com'),
			'joe.blogs@theguardian.com',
		);

		for (const [index, expectedBody] of [
			'Saved preview text',
			'',
			'Saved preview text',
		].entries()) {
			if (index > 0) {
				await userEvent.click(toggle);
			}
			await waitFor(() => expect(previewBodyText()).toBe(expectedBody));
			await userEvent.click(canvas.getByRole('button', { name: 'Send test' }));
			await expect(canvas.findByText('Test email sent')).resolves.toBeVisible();
			await expect(requestPreviewTextTestEmail).toHaveBeenCalledTimes(
				index + 1,
			);
			await expect(
				requestPreviewTextTestEmail.mock.calls[index]?.[0],
			).toHaveProperty('content.items.lead-story.body', expectedBody);
		}

		await expect(canvas.getByLabelText('Preview text')).toHaveValue(
			'Saved preview text',
		);
	},
};
