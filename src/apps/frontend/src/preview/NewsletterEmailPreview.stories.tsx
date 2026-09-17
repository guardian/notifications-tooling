import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import type { NotificationFormContextProps } from '../compose/NotificationContext';
import { fetchFailError } from '../testing/api-fixtures';
import { articleFixture } from '../testing/capi-fixtures';
import { mockRequestEmailHtmlWithoutDelay } from '../testing/mock-fetch-email';
import { WithNotificationContext } from '../testing/story-helpers';
import type { NotificationState } from '../types';
import type { NewsletterFormValues } from '../utils/notification-forms';
import { defaultState } from '../utils/notification-reducer';
import { NewsletterEmailPreview } from './HTMLPreview';

type StoryArgs = {
	notificationState: NotificationState;
	formValues?: Partial<NewsletterFormValues>;
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
		notificationState: defaultState,
	},
	render: ({ notificationState, formValues, functions }) =>
		WithNotificationContext(
			<NewsletterEmailPreview />,
			notificationState,
			functions,
			'email',
			formValues,
		),
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
			...defaultState,
			content: articleFixture,
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
			...defaultState,
			content: articleFixture,
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

export const Loading: Story = {
	args: {
		notificationState: {
			...defaultState,
			content: articleFixture,
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
			...defaultState,
			content: articleFixture,
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
