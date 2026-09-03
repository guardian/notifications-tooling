import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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
