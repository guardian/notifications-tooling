import { type ReactNode, useReducer } from 'react';
import {
	defaultState,
	notificationReducer,
} from '../features/stand-frontend/notification-reducer';
import type { NotificationFormContextProps } from '../features/stand-frontend/NotificationContext';
import { NotificationFormContext } from '../features/stand-frontend/NotificationContext';
import type {
	EmailNotification,
	NotificationAction,
	NotificationState,
	PushNotification,
} from '../features/stand-frontend/types';
import { articleFixture } from '../mocks/capi-fixtures';
import { mockCapiFetch } from '../mocks/mock-capi-fetch';
import { mockRequestEmailHtml } from '../mocks/mock-fetch-email';
import { mockRequestTestEmailSend } from '../mocks/mock-request-test-email-send';
import { mockSendNotification } from '../mocks/mock-send-notification';
import { parseHtml } from '../util/html-helpers';

export const WithNotificationContext = (
	reactNode: ReactNode,
	notificationState: NotificationState = defaultState,
	functions: Partial<
		Omit<NotificationFormContextProps, 'notification' | 'updateNotification'>
	> = {},
) => {
	const [notification, updateNotification] = useReducer<
		NotificationState,
		[NotificationAction]
	>(notificationReducer, notificationState);

	const {
		capiFetch = mockCapiFetch,
		sendNotification = mockSendNotification,
		requestEmailHtml = mockRequestEmailHtml,
		requestTestEmailSend = mockRequestTestEmailSend,
	} = functions;

	return (
		<NotificationFormContext
			value={{
				notification,
				updateNotification,
				capiFetch,
				sendNotification,
				requestEmailHtml,
				requestTestEmailSend,
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

export const populatedEmailState = {
	...defaultState,
	content: articleFixture,
	fetchedArticleId: articleFixture.id,
	parameters: completeEmailParams,
};

export const completePushParams: PushNotification = {
	type: 'push',
	alertType: 'breaking-news',
	headline: articleFixture.fields?.headline,
	pushDeliveryOption: 'appImmediate',
	editions: ['UK', 'INT'],
};

export const populatedPushState: NotificationState = {
	...defaultState,
	content: articleFixture,
	fetchedArticleId: articleFixture.id,
	parameters: completePushParams,
};
