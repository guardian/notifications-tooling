import type { Meta, StoryObj } from '@storybook/react-vite';
import { acceptedEmailSendResponse } from '../../../mocks/api-fixtures';
import {
	completeEmailParams,
	completePushParams,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { DispatchReport } from './DispatchReport';

type StoryArgs = { notificationState: NotificationState };
type Story = StoryObj<StoryArgs>;

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/DispatchReport',
	component: DispatchReport,
	parameters: {
		docs: {
			description: {
				component:
					'This is a non-functional placeholder to demonstrate how content will appear in the layout.',
			},
		},
	},
	render: (args) => {
		return WithNotificationContext(<DispatchReport />, args.notificationState);
	},
};

export default meta;

export const EmailSuccess: Story = {
	args: {
		notificationState: {
			...defaultState,
			parameters: completeEmailParams,
			sendingResult: {
				ok: true,
				response: acceptedEmailSendResponse,
			},
		},
	},
};

export const AppAlertSuccess: Story = {
	args: {
		notificationState: {
			...defaultState,
			parameters: completePushParams,
			sendingResult: {
				ok: true,
				response: acceptedEmailSendResponse,
			},
		},
	},
};
