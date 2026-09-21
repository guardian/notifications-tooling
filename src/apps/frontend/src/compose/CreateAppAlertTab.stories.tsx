import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { ConfigContext } from '../config/ConfigContext';
import { notificationRoutes, withArticleUrl } from '../routes';
import { mockAppConfig } from '../testing/app-config';
import { articleFixture } from '../testing/capi-fixtures';
import {
	FIVE_FOUR_CROP_RESPONSE,
	GRID_CROP_ID,
	GRID_IMAGE_ID,
} from '../testing/grid-fixtures';
import {
	completeAppAlertFormValues,
	populatedAppAlertComposerState,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import { defaultAppAlertComposerState } from '../utils/notification-composer-reducer';
import type { AppAlertFormValues } from '../utils/notification-forms';
import { CreateAppAlertTab } from './CreateAppAlertTab';

type StoryArgs = {
	composerState: NotificationComposerState;
	formValues?: Partial<AppAlertFormValues>;
	containerMinWidth: string;
};

const meta = {
	title: 'Dispatch/Compose/CreateAppAlertTab',
	component: CreateAppAlertTab,
	args: {
		composerState: defaultAppAlertComposerState,
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
	render: function Render(args: StoryArgs) {
		const { formValues, composerState, containerMinWidth } = args;
		return (
			<div
				style={{
					display: 'flex',
					minWidth: containerMinWidth,
					minHeight: '100vh',
					boxSizing: 'border-box',
				}}
			>
				{useNotificationFormStory(
					<CreateAppAlertTab />,
					composerState,
					{},
					'app-push',
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

export const ImportsArticleFromSearchParam: Story = {
	beforeEach: () => {
		const originalUrl = window.location.href;
		window.history.replaceState(
			null,
			'',
			withArticleUrl(
				notificationRoutes['app-push'].create,
				articleFixture.webUrl,
			),
		);

		return () => window.history.replaceState(null, '', originalUrl);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		await expect(await canvas.findByText('Article imported')).toBeVisible();
		await expect(canvas.getByLabelText('article URL')).toHaveValue(
			articleFixture.webUrl,
		);
		await expect(canvas.getByRole('textbox', { name: 'Headline' })).toHaveValue(
			articleFixture.fields?.headline,
		);
		await expect(
			canvas.getByRole('button', { name: 'Show article thumbnail image' }),
		).toHaveAttribute('aria-pressed', 'true');
	},
};

export const ConfirmationStep: Story = {
	args: {
		composerState: {
			...populatedAppAlertComposerState,
			isSendConfirmationOpen: true,
		},
		formValues: completeAppAlertFormValues,
	},
	play: async ({ canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			screen.getByText('Are you sure you want to send the app alert?'),
		).toBeVisible();
		await expect(
			screen.getByText('Sent app alerts cannot be undone.'),
		).toBeVisible();

		await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		await expect(
			screen.queryByText('Are you sure you want to send the app alert?'),
		).not.toBeInTheDocument();
	},
};

export const RestoresOriginalThumbnailAfterClearingReplacement: Story = {
	args: {
		composerState: populatedAppAlertComposerState,
		formValues: completeAppAlertFormValues,
	},
	parameters: {
		msw: {
			handlers: [
				http.get('https://media.guim.co.uk/replacement-thumbnail.jpg', () =>
					HttpResponse.text('<svg xmlns="http://www.w3.org/2000/svg" />', {
						headers: { 'Content-Type': 'image/svg+xml' },
					}),
				),
			],
		},
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
				name: 'Replace image',
			}),
		);
		const replacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		const updateButton = canvas.getByRole('button', { name: 'Update' });

		await userEvent.type(replacementInput, replacementThumbnailUrl);
		await userEvent.click(updateButton);
		await expect(await canvas.findByText('Image updated')).toBeVisible();

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
		await expect(
			canvas.getByRole('button', { name: 'Replace image' }),
		).toHaveAttribute('aria-expanded', 'true');

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

		await userEvent.click(thumbnailToggle);
		await userEvent.click(thumbnailToggle);
		await expect(
			canvas.getByRole('button', { name: 'Replace image' }),
		).toHaveAttribute('aria-expanded', 'false');
		await expect(
			canvas.queryByRole('textbox', { name: 'replacement image URL' }),
		).not.toBeInTheDocument();
	},
};

export const FallsBackToOriginalThumbnailOnBrokenReplacementImage: Story = {
	args: {
		composerState: populatedAppAlertComposerState,
		formValues: completeAppAlertFormValues,
	},
	parameters: {
		msw: {
			handlers: [
				http.get('https://media.guim.co.uk/replacement-thumbnail.jpg', () =>
					HttpResponse.text('<svg xmlns="http://www.w3.org/2000/svg" />', {
						headers: { 'Content-Type': 'image/svg+xml' },
					}),
				),
				http.get(
					'https://media.guim.co.uk/broken-thumbnail.jpg',
					() =>
						new HttpResponse(null, {
							status: 403,
							statusText: 'Forbidden',
						}),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const originalThumbnailUrl = articleFixture.fields?.thumbnail ?? '';
		const replacementThumbnailUrl =
			'https://media.guim.co.uk/replacement-thumbnail.jpg';
		const brokenReplacementThumbnailUrl =
			'https://media.guim.co.uk/broken-thumbnail.jpg';

		await userEvent.click(
			canvas.getByRole('button', {
				name: 'Replace image',
			}),
		);
		const replacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		await userEvent.type(replacementInput, replacementThumbnailUrl);
		await userEvent.click(canvas.getByRole('button', { name: 'Update' }));
		await expect(await canvas.findByText('Image updated')).toBeVisible();
		for (const thumbnail of [
			canvas.getByAltText('Article thumbnail'),
			canvas.getByAltText('Android article thumbnail'),
		]) {
			await expect(thumbnail).toHaveAttribute('src', replacementThumbnailUrl);
		}

		await userEvent.clear(replacementInput);
		await userEvent.type(replacementInput, brokenReplacementThumbnailUrl);
		await userEvent.click(canvas.getByRole('button', { name: 'Update' }));
		await expect(await canvas.findByText('Unable to load image')).toBeVisible();
		await expect(canvas.queryByText('Image updated')).not.toBeInTheDocument();

		for (const thumbnail of [
			canvas.getByAltText('Article thumbnail'),
			canvas.getByAltText('Android article thumbnail'),
		]) {
			await expect(thumbnail).toHaveAttribute('src', originalThumbnailUrl);
		}
	},
};

export const AcceptsGridCropReplacementThumbnail: Story = {
	args: {
		composerState: populatedAppAlertComposerState,
		formValues: completeAppAlertFormValues,
	},
	decorators: [
		(Story) => (
			<ConfigContext.Provider value={mockAppConfig}>
				<Story />
			</ConfigContext.Provider>
		),
	],
	parameters: {
		msw: {
			handlers: [
				http.get(`${mockAppConfig.gridApiUri}/images/${GRID_IMAGE_ID}`, () =>
					HttpResponse.json(FIVE_FOUR_CROP_RESPONSE),
				),
				http.get(
					`https://media.guim.co.uk/${GRID_IMAGE_ID}/${GRID_CROP_ID}/1000.jpg`,
					() =>
						HttpResponse.text('<svg xmlns="http://www.w3.org/2000/svg" />', {
							headers: { 'Content-Type': 'image/svg+xml' },
						}),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const gridCropUrl = `${mockAppConfig.gridUri}/images/${GRID_IMAGE_ID}?crop=${GRID_CROP_ID}`;
		const resolvedThumbnailUrl = `https://media.guim.co.uk/${GRID_IMAGE_ID}/${GRID_CROP_ID}/1000.jpg`;

		await userEvent.click(
			canvas.getByRole('button', { name: 'Replace image' }),
		);
		const replacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		await userEvent.click(replacementInput);
		await userEvent.paste(gridCropUrl);
		await userEvent.click(canvas.getByRole('button', { name: 'Update' }));

		await expect(await canvas.findByText('Image updated')).toBeVisible();
		await expect(replacementInput).toHaveValue(gridCropUrl);
		for (const thumbnail of [
			canvas.getByAltText('Article thumbnail'),
			canvas.getByAltText('Android article thumbnail'),
		]) {
			await expect(thumbnail).toHaveAttribute('src', resolvedThumbnailUrl);
		}
	},
};

export const ShowsErrorWhenGridLookupFails: Story = {
	args: {
		composerState: populatedAppAlertComposerState,
		formValues: completeAppAlertFormValues,
	},
	decorators: [
		(Story) => (
			<ConfigContext.Provider value={mockAppConfig}>
				<Story />
			</ConfigContext.Provider>
		),
	],
	parameters: {
		msw: {
			handlers: [
				http.get(
					`${mockAppConfig.gridApiUri}/images/${GRID_IMAGE_ID}`,
					() => new HttpResponse(null, { status: 501 }),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const gridCropUrl = `${mockAppConfig.gridUri}/images/${GRID_IMAGE_ID}?crop=${GRID_CROP_ID}`;

		await userEvent.click(
			canvas.getByRole('button', { name: 'Replace image' }),
		);
		const replacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		await userEvent.click(replacementInput);
		await userEvent.paste(gridCropUrl);
		await userEvent.click(canvas.getByRole('button', { name: 'Update' }));

		await expect(
			await canvas.findByText(
				'Failed to retrieve the image details from the grid. Please try again',
			),
		).toBeVisible();
	},
};

export const ShowsErrorAndAuthButtonWhenGridApiReturnsForbidden: Story = {
	args: {
		composerState: populatedAppAlertComposerState,
		formValues: completeAppAlertFormValues,
	},
	decorators: [
		(Story) => (
			<ConfigContext.Provider value={mockAppConfig}>
				<Story />
			</ConfigContext.Provider>
		),
	],
	parameters: {
		msw: {
			handlers: [
				http.get(
					`${mockAppConfig.gridApiUri}/images/${GRID_IMAGE_ID}`,
					() => new HttpResponse(null, { status: 401 }),
				),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const gridCropUrl = `${mockAppConfig.gridUri}/images/${GRID_IMAGE_ID}?crop=${GRID_CROP_ID}`;

		await userEvent.click(
			canvas.getByRole('button', { name: 'Replace image' }),
		);
		const replacementInput = canvas.getByRole('textbox', {
			name: 'replacement image URL',
		});
		await userEvent.click(replacementInput);
		await userEvent.paste(gridCropUrl);
		await userEvent.click(canvas.getByRole('button', { name: 'Update' }));

		await expect(
			await canvas.findByText(
				'Your Authentication credentials for the grid have expired',
			),
		).toBeVisible();

		await expect(
			canvasElement.querySelector(`[href="${mockAppConfig.gridUri}"]`),
		).toBeInTheDocument();
	},
};
