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
import { CreateAppAlertTab } from './CreateAppAlertTab';

type StoryArgs = {
	notificationState: NotificationState;
	formValues?: Partial<AppAlertFormValues>;
	containerMinWidth: string;
};

const meta = {
	title: 'Stand Frontend/CreateAppAlertTab',
	component: CreateAppAlertTab,
	args: {
		notificationState: defaultAppAlertState,
		containerMinWidth: '1600px',
	},
	argTypes: {
		containerMinWidth: {
			control: 'text',
			description:
				'Width of the story container, used to exercise the tab layout breakpoints at 1310px and 1500px.',
		},
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'App alert creation tab combining the notification form and preview with selected channel,alert type, editions  and delivery timing.',
			},
		},
	},
	render: (args: StoryArgs) => {
		const { formValues, notificationState, containerMinWidth } = args;
		return (
			<div
				style={{
					display: 'flex',
					minWidth: containerMinWidth,
					minHeight: '100vh',
					boxSizing: 'border-box',
				}}
			>
				{WithNotificationContext(
					<CreateAppAlertTab />,
					notificationState,
					{},
					'push',
					formValues,
				)}
			</div>
		);
	},
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole('heading', { name: 'Create app alert' }),
		).toBeInTheDocument();
		await expect(
			canvas.queryByText('The preview for the app alert will be shown below.'),
		).not.toBeInTheDocument();
	},
};

export const ConfirmationStep: Story = {
	args: {
		notificationState: {
			...populatedPushState,
			confirmSendModalOpen: true,
		},
		formValues: completePushParams,
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			screen.getByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
		await expect(
			screen.getByText('Sent app alerts cannot be undone'),
		).toBeVisible();

		await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		await expect(
			screen.queryByText('Are you sure you want to send the app alert?'),
		).not.toBeInTheDocument();
	},
};

export const RestoresOriginalThumbnailAfterClearingReplacement: Story = {
	args: {
		notificationState: populatedPushState,
		formValues: completePushParams,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const originalThumbnailUrl = articleFixture.fields?.thumbnail ?? '';
		const replacementThumbnailUrl =
			'https://media.guim.co.uk/replacement-thumbnail.jpg';
		const thumbnailToggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});
		const articleThumbnail = canvas.getByAltText(
			'Thumbnail for A rhyme to recall rising temperatures',
		);
		const iPhoneThumbnail = canvas.getByAltText('Article thumbnail');
		const androidThumbnail = canvas.getByAltText('Android article thumbnail');

		await userEvent.click(
			canvas.getByRole('button', {
				name: 'add replacement image URL button',
			}),
		);
		const replacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		const updateButton = canvas.getByRole('button', { name: 'Update' });

		await userEvent.type(replacementInput, replacementThumbnailUrl);
		await userEvent.click(updateButton);

		await expect(articleThumbnail).toHaveAttribute('src', originalThumbnailUrl);
		for (const thumbnail of [iPhoneThumbnail, androidThumbnail]) {
			await expect(thumbnail).toHaveAttribute('src', replacementThumbnailUrl);
		}

		await userEvent.click(thumbnailToggle);
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'false');
		await expect(articleThumbnail).toHaveAttribute('src', originalThumbnailUrl);
		await expect(
			canvas.queryByAltText('Article thumbnail'),
		).not.toBeInTheDocument();
		await expect(
			canvas.queryByAltText('Android article thumbnail'),
		).not.toBeInTheDocument();
		await userEvent.click(thumbnailToggle);
		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'true');

		const restoredIPhoneThumbnail = canvas.getByAltText('Article thumbnail');
		const restoredAndroidThumbnail = canvas.getByAltText(
			'Android article thumbnail',
		);
		for (const thumbnail of [
			restoredIPhoneThumbnail,
			restoredAndroidThumbnail,
		]) {
			await expect(thumbnail).toHaveAttribute('src', replacementThumbnailUrl);
		}

		await userEvent.click(
			canvas.getByRole('button', {
				name: 'add replacement image URL button',
			}),
		);
		const retainedReplacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		await expect(retainedReplacementInput).toHaveValue(replacementThumbnailUrl);

		await userEvent.clear(retainedReplacementInput);
		await userEvent.click(canvas.getByRole('button', { name: 'Update' }));

		await expect(thumbnailToggle).toHaveAttribute('aria-pressed', 'true');
		for (const thumbnail of [
			canvas.getByAltText(
				'Thumbnail for A rhyme to recall rising temperatures',
			),
			canvas.getByAltText('Article thumbnail'),
			canvas.getByAltText('Android article thumbnail'),
		]) {
			await expect(thumbnail).toHaveAttribute('src', originalThumbnailUrl);
		}
	},
};
