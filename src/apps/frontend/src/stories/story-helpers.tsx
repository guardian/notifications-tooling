import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useReducer } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
	appAlertFormSchema,
	type AppAlertFormValues,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
	newsletterFormSchema,
	type NewsletterFormValues,
} from '../features/stand-frontend/notification-forms';
import {
	defaultAppAlertState,
	defaultState,
	notificationReducer,
} from '../features/stand-frontend/notification-reducer';
import type { NotificationFormContextProps } from '../features/stand-frontend/NotificationContext';
import { NotificationFormContext } from '../features/stand-frontend/NotificationContext';
import type {
	ChannelOption,
	NotificationAction,
	NotificationState,
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
		Omit<
			NotificationFormContextProps,
			'channel' | 'notification' | 'updateNotification'
		>
	> = {},
	channel: ChannelOption = 'email',
	formValues?: Partial<NewsletterFormValues> | Partial<AppAlertFormValues>,
) => {
	const [notification, updateNotification] = useReducer<
		NotificationState,
		[NotificationAction]
	>(notificationReducer, notificationState);
	const newsletterValues =
		channel === 'email'
			? (formValues as Partial<NewsletterFormValues> | undefined)
			: undefined;
	const appAlertValues =
		channel === 'push'
			? (formValues as Partial<AppAlertFormValues> | undefined)
			: undefined;
	const newsletterForm = useForm({
		defaultValues: {
			...defaultNewsletterFormValues,
			...newsletterValues,
		},
		resolver: zodResolver(newsletterFormSchema),
	});
	const appAlertForm = useForm({
		defaultValues: {
			...defaultAppAlertFormValues,
			...appAlertValues,
		},
		resolver: zodResolver(appAlertFormSchema),
	});

	const {
		capiFetch = mockCapiFetch,
		sendNotification = mockSendNotification,
		requestEmailHtml = mockRequestEmailHtml,
		requestTestEmailSend = mockRequestTestEmailSend,
	} = functions;

	const context = (
		<NotificationFormContext
			value={{
				channel,
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

	return channel === 'email' ? (
		<FormProvider {...newsletterForm}>{context}</FormProvider>
	) : (
		<FormProvider {...appAlertForm}>{context}</FormProvider>
	);
};

export const completeEmailParams: NewsletterFormValues = {
	kicker: 'exclusive',
	subject: articleFixture.fields?.headline ?? '',
	preview: parseHtml(articleFixture.fields?.standfirst).textContent,
	deliveryOption: 'immediate',
	audienceSegments: ['AU', 'UK'],
};

export const populatedEmailState = {
	...defaultState,
	content: articleFixture,
	fetchedArticleId: articleFixture.id,
};

export const completePushParams: AppAlertFormValues = {
	alertType: 'breaking-news',
	headline: articleFixture.fields?.headline ?? '',
	deliveryOption: 'appImmediate',
	editions: ['UK', 'INT'],
};

export const populatedPushState: NotificationState = {
	...defaultAppAlertState,
	content: articleFixture,
	fetchedArticleId: articleFixture.id,
};
