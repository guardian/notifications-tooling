import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import {
	completePushParams,
	populatedPushState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import type { AppAlertFormValues } from '../notification-forms';
import { defaultAppAlertState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { CreateAppAlertForm } from './CreateAppAlertForm';

type StoryArgs = {
	notificationState: NotificationState;
	activeSectionHref: string;
	formValues?: Partial<AppAlertFormValues>;
};
type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/CreateAppAlertForm',
	component: CreateAppAlertForm,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The form for creating an app alert notification. This story shows the form in various states, including empty, populated, and error states.',
			},
		},
	},
	args: {
		notificationState: defaultAppAlertState,
		activeSectionHref: '#article-section',
	},
	render: (args) => {
		const { activeSectionHref, formValues, notificationState } = args;
		return WithNotificationContext(
			<CreateAppAlertForm activeSectionHref={activeSectionHref} />,
			notificationState,
			{},
			'push',
			formValues ??
				(notificationState.content ? completePushParams : undefined),
		);
	},
};

export default meta;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Create app alert')).toBeInTheDocument();
		await expect(canvas.getByText('Article')).toBeInTheDocument();
		await expect(canvas.getByText('Alert type')).toBeInTheDocument();
		await expect(canvas.getByText('Editions')).toBeInTheDocument();
		await expect(canvas.getByText('Headline')).toBeInTheDocument();
		await expect(canvas.getByText('Delivery and timing')).toBeInTheDocument();
		await expect(canvas.getByText('Send')).toBeInTheDocument();
		await expect(
			canvas.getByText('The app alert is sent immediately'),
		).toBeVisible();
		await expect(canvas.getByText('Sends right now')).toBeVisible();
	},
};

export const UpdatesFormFields: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const screen = within(canvasElement.ownerDocument.body);
		const alertType = canvas.getByRole('button', {
			name: 'Breaking News Alert type',
		});
		const unitedKingdom = canvas.getByRole('checkbox', {
			name: 'Select United Kingdom',
		});
		const headline = canvas.getByLabelText('Headline');

		await userEvent.click(alertType);
		await userEvent.click(screen.getByRole('option', { name: 'Sport' }));
		await userEvent.click(unitedKingdom);
		await userEvent.type(headline, 'A developing story');

		await expect(
			canvas.getByRole('button', { name: 'Sport Alert type' }),
		).toBeVisible();
		await expect(unitedKingdom).toBeChecked();
		await expect(headline).toHaveValue('A developing story');
		await expect(
			canvas.getByLabelText('Headline character count'),
		).toHaveTextContent('18/');
	},
};

export const ValidationErrors: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(
			canvas.getByRole('button', { name: 'Send app alert' }),
		);

		await expect(canvas.getByText('Headline is required')).toBeVisible();
		await expect(canvas.getByText('Please select an edition')).toBeVisible();
		await expect(
			canvas.getByText('Paste a URL to fetch an article'),
		).toBeVisible();
	},
};

export const PastRecommendedStillSends: Story = {
	args: {
		notificationState: populatedPushState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const headline = canvas.getByLabelText('Headline');
		await userEvent.clear(headline);
		await userEvent.type(headline, 'a'.repeat(201));

		await expect(canvas.queryByText('Recommended')).not.toBeInTheDocument();
		await expect(canvas.getByText('Warning')).toBeVisible();
		await expect(
			canvas.getByText('90 characters or fewer preferred'),
		).toBeVisible();

		await userEvent.click(
			canvas.getByRole('button', { name: 'Send app alert' }),
		);

		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
	},
};

export const WithImportedArticle: Story = {
	args: {
		notificationState: populatedPushState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Article imported')).toBeVisible();
		await expect(canvas.getByLabelText('Headline')).toHaveValue(
			articleFixture.fields?.headline,
		);
	},
};

export const WithThumbnail: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: completePushParams,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumbnailToggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});
		await expect(thumbnailToggle).toBeEnabled();
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'true');
		await expect(
			canvas.getByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
		).toBeVisible();
	},
};

export const WithReplacementThumbnail: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: completePushParams,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const replacementThumbnailUrl =
			'https://media.guim.co.uk/replacement-thumbnail.jpg';
		const replacementInput = canvas.getByLabelText('replacement image URL');
		const updateButton = canvas.getByRole('button', { name: 'Update' });
		const thumbnail = canvas.getByAltText(
			'Thumbnail for A rhyme to recall rising temperatures',
		);

		await expect(thumbnail).toHaveAttribute(
			'src',
			articleFixture.fields?.thumbnail,
		);

		await userEvent.clear(replacementInput);
		await userEvent.type(replacementInput, replacementThumbnailUrl);
		await expect(thumbnail).toHaveAttribute(
			'src',
			articleFixture.fields?.thumbnail,
		);

		await userEvent.click(updateButton);

		await expect(thumbnail).toHaveAttribute('src', replacementThumbnailUrl);
	},
};

export const WithThumbnailTurnedOff: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: { ...completePushParams, includeThumbnail: false },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumbnailToggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(thumbnailToggle).toBeEnabled();
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'false');
		await expect(
			canvas.queryByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
		).not.toBeInTheDocument();
	},
};

export const WithoutThumbnail: Story = {
	args: {
		notificationState: {
			...populatedPushState,
			content: {
				...articleFixture,
				fields: { ...articleFixture.fields, thumbnail: '' },
			},
		},
		formValues: {
			...completePushParams,
			includeThumbnail: false,
			articleThumbnailUrl: '',
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumbnailToggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(canvas.getByText('Article imported')).toBeVisible();
		await expect(thumbnailToggle).toBeDisabled();
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'false');
		await expect(
			canvas.queryByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
		).not.toBeInTheDocument();
	},
};

export const SubmitWithNativeForm: Story = {
	args: {
		notificationState: populatedPushState,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const form = canvas.getByRole<HTMLFormElement>('form', {
			name: 'Create app alert',
		});
		await expect(form).toBeVisible();
		await expect(form).toHaveAttribute('method', 'post');
		await expect(form).toHaveAttribute('novalidate');
		form.requestSubmit();

		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
	},
};

export const Empty: Story = {
	args: {
		notificationState: {
			...defaultAppAlertState,
			isFetchingContent: false,
			confirmSendModalOpen: false,
			isWaitingForSend: false,
		},
	},
};

export const FetchingArticle: Story = {
	args: {
		notificationState: {
			...defaultAppAlertState,
			isFetchingContent: true,
		},
	},
};

export const FetchArticleError: Story = {
	args: {
		notificationState: {
			...defaultAppAlertState,
			isFetchingContent: false,
			fetchArticleError: 'Failed to fetch article',
		},
	},
};
