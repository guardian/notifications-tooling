import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import type { NotificationFormContextProps } from '../compose/NotificationFormContext';
import { fetchFailError } from '../testing/api-fixtures';
import { articleFixture } from '../testing/capi-fixtures';
import { mockRequestEmailHtmlWithoutDelay } from '../testing/mock-fetch-email';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import { defaultAppAlertComposerState } from '../utils/notification-composer-reducer';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { NewsletterEmailPreview } from './HTMLPreview';

type StoryArgs = {
	notificationState: NotificationComposerState;
	formValues?: Partial<NewsletterEmailFormValues>;
	functions?: Partial<
		Omit<
			NotificationFormContextProps,
			'channel' | 'notification' | 'updateNotification'
		>
	>;
};

type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Preview/NewsletterEmailPreview',
	component: NewsletterEmailPreview,
	args: {
		notificationState: defaultAppAlertComposerState,
	},
	render: function Render({ notificationState, functions, formValues }) {
		return useNotificationFormStory(
			<NewsletterEmailPreview />,
			notificationState,
			functions,
			'newsletter',
			formValues,
		);
	},
};

export default meta;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('No article loaded')).toBeInTheDocument();
	},
};

export const WithContentNoAudience: Story = {
	args: {
		notificationState: {
			...defaultAppAlertComposerState,
			article: articleFixture,
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText(
				'Choose an audience in order to preview the newsletter email',
			),
		).toBeInTheDocument();
	},
};

export const WithContentAndAudience: Story = {
	args: {
		notificationState: {
			...defaultAppAlertComposerState,
			article: articleFixture,
		},
		formValues: {
			audienceSegments: ['UK'],
		},
		functions: {
			requestEmailHtml: mockRequestEmailHtmlWithoutDelay,
		},
	},
	play: async ({ canvasElement }) => {
		await waitFor(() =>
			expect(
				canvasElement.querySelector('article table h2'),
			).toBeInTheDocument(),
		);
	},
};

export const UntrustedHtml: Story = {
	args: {
		...WithContentAndAudience.args,
		formValues: {
			audienceSegments: ['UK'],
			subjectText: '<img src=x onerror=alert(1)>',
			previewText: 'Editor preview text',
			showPreview: true,
		},
		functions: {
			requestEmailHtml: async (request) => {
				const result = await mockRequestEmailHtmlWithoutDelay(request);
				if (!result.success) {
					return result;
				}
				return {
					...result,
					data: {
						...result.data,
						html: `<!DOCTYPE html><html><head>
							<meta http-equiv="refresh" content="0;url=https://example.com">
							<base href="https://example.com" target="_top">
							<style>
								.preview-security-fixture { color: rgb(12, 34, 56); }
								@media screen and (min-width: 0px) {
									.preview-security-fixture { font-size: 12px !important; }
								}
							</style>
						</head><body>
							<p class="preview-security-fixture">Email stylesheet</p>
							<script>document.title = 'Compromised preview';</script>
							<img src="data:image/png,invalid" onerror="document.title = 'Compromised preview'">
							<svg onload="document.title = 'Compromised preview'"></svg>
							<iframe srcdoc="<script>parent.document.title = 'Compromised preview'</script>"></iframe>
							<form action="https://example.com"><button>Submit malicious form</button></form>
							<a href="javascript:document.title = 'Compromised preview'">Unsafe link</a>
							<a href="https://example.com" target="_top">External link</a>
							<div style="display: block !important">${result.data.html}</div>
						</body></html>`,
					},
				};
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const originalTitle = document.title;
		await waitFor(async () => {
			await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent(
				'<img src=x onerror=alert(1)>',
			);
			await expect(canvas.getByText('Editor preview text')).toBeInTheDocument();
			await expect(canvas.getByText('Email stylesheet')).toHaveStyle({
				color: 'rgb(12, 34, 56)',
				fontSize: '12px',
			});
			await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
			await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
		});
		await expect(canvas.getByText('Newsletter email preview')).toBeVisible();
		await expect(document.title).toBe(originalTitle);
	},
};

export const Loading: Story = {
	args: {
		notificationState: {
			...defaultAppAlertComposerState,
			article: articleFixture,
		},
		formValues: {
			audienceSegments: ['UK'],
		},
		functions: {
			requestEmailHtml: () => new Promise(() => {}),
		},
	},
};
export const FailedToLoad: Story = {
	args: {
		notificationState: {
			...defaultAppAlertComposerState,
			article: articleFixture,
		},
		formValues: {
			audienceSegments: ['UK'],
		},
		functions: {
			requestEmailHtml: () =>
				Promise.resolve({
					success: false,
					failure: fetchFailError,
				}),
		},
	},
};
