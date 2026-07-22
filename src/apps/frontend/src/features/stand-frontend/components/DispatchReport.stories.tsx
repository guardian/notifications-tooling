import type { Meta, StoryObj } from '@storybook/react-vite';
import { articleFixture } from '../../../mocks/capi-fixtures';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { parseHtml } from '../../../util/html-helpers';
import { defaultState } from '../notification-reducer';
import type { EmailNotification, NotificationState } from '../types';
import { DispatchReport } from './DispatchReport';

type StoryArgs = { notificationState: NotificationState };
type Story = StoryObj<StoryArgs>;

const completeEmailParams: EmailNotification = {
	type: 'email',
	kicker: 'exclusive',
	subject: articleFixture.fields?.headline,
	preview: parseHtml(articleFixture.fields?.standfirst).textContent,
	emailDeliveryOption: 'immediate',
	audienceSegments: ['AU', 'UK'],
};

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

export const EmailFail: Story = {
	args: {
		notificationState: {
			...defaultState,
			parameters: completeEmailParams,
			sendingResult: {
				ok: false,
			},
		},
	},
};
