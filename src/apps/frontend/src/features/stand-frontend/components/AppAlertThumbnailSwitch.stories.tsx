import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { articleFixture } from '../../../mocks/capi-fixtures';
import {
	completePushParams,
	populatedPushState,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import type { NotificationState } from '../types';
import { AppAlertThumbnailSwitch } from './AppAlertThumbnailSwitch';

type StoryArgs = {
	notificationState: NotificationState;
	includeThumbnail: boolean;
};

const meta = {
	title: 'Stand Frontend/AppAlertThumbnailSwitch',
	component: AppAlertThumbnailSwitch,
	parameters: {
		docs: {
			description: {
				component:
					'Controls whether the imported article thumbnail is included in an app alert.',
			},
		},
	},
	args: {
		notificationState: populatedPushState,
		includeThumbnail: true,
	},
	render: ({ notificationState, includeThumbnail }) =>
		WithNotificationContext(
			<AppAlertThumbnailSwitch />,
			notificationState,
			{},
			'push',
			{ ...completePushParams, includeThumbnail },
		),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectedWithThumbnail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(toggle).toBeEnabled();
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
	},
};

export const DeselectedWithThumbnail: Story = {
	args: {
		includeThumbnail: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(toggle).toBeEnabled();
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
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
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(toggle).toBeDisabled();
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	},
};
