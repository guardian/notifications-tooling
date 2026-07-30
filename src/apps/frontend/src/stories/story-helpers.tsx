import { type ReactNode, useReducer } from 'react';
import {
	defaultState,
	notificationReducer,
} from '../features/stand-frontend/notification-reducer';
import { NotificationFormContext } from '../features/stand-frontend/NotificationContext';
import type {
	EmailNotification,
	NotificationAction,
	NotificationState,
} from '../features/stand-frontend/types';
import { articleFixture } from '../mocks/capi-fixtures';
import { mockCapiFetch } from '../mocks/mock-capi-fetch';
import { mockRequestEmailHtml } from '../mocks/mock-fetch-email';
import { mockSendNotification } from '../mocks/mock-send-notification';
import { parseHtml } from '../util/html-helpers';

export const WithNotificationContext = (
	reactNode: ReactNode,
	notificationState: NotificationState = defaultState,
) => {
	const [notification, updateNotification] = useReducer<
		NotificationState,
		[NotificationAction]
	>(notificationReducer, notificationState);

	return (
		<NotificationFormContext
			value={{
				notification,
				updateNotification,
				capiFetch: mockCapiFetch,
				sendNotification: mockSendNotification,
				requestEmailHtml: mockRequestEmailHtml,
			}}
		>
			{reactNode}
		</NotificationFormContext>
	);
};

export const completeEmailParams: EmailNotification = {
	type: 'email',
	kicker: 'exclusive',
	subject: articleFixture.fields?.headline,
	preview: parseHtml(articleFixture.fields?.standfirst).textContent,
	emailDeliveryOption: 'immediate',
	audienceSegments: ['AU', 'UK'],
};
