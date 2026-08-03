import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	completeEmailParams,
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
	args: {
		notificationState: {
			...defaultState,
			parameters: completeEmailParams,
			sendingResult: {
				ok: true,
			},
		},
	},
	render: (args) => {
		return WithNotificationContext(<DispatchReport />, args.notificationState);
	},
};

export default meta;

export const EmailSuccess: Story = {};

