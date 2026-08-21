import type { Meta, StoryObj } from '@storybook/react-vite';
import { acceptedEmailSendResponse } from '../../../mocks/api-fixtures';
import {
	completeEmailParams,
	WithNotificationContext,
} from '../../../stories/story-helpers';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { DispatchReport, NewsletterDispatchDetails } from './DispatchReport';

type StoryArgs = { notificationState: NotificationState };
type Story = StoryObj<StoryArgs>;

const DispatchReportStory = ({ notificationState }: StoryArgs) =>
	WithNotificationContext(
		<DispatchReport onResetNotification={() => {}}>
			<NewsletterDispatchDetails />
		</DispatchReport>,
		notificationState,
		{},
		'email',
		completeEmailParams,
	);

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/DispatchReport',
	component: DispatchReportStory,
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
			sendingResult: {
				ok: true,
				response: acceptedEmailSendResponse,
			},
		},
	},
};

export default meta;

export const EmailSuccess: Story = {};
