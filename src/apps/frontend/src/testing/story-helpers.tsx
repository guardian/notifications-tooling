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
} from '../compose/notification-forms';
import {
	defaultAppAlertState,
	defaultState,
	notificationReducer,
} from '../compose/notification-reducer';
import type { NotificationFormContextProps } from '../compose/NotificationContext';
import { NotificationFormContext } from '../compose/NotificationContext';
import type {
	ChannelOption,
	NotificationAction,
	NotificationState,
} from '../types';
import { parseHtml } from '../ui/html-helpers';
import { articleFixture } from './capi-fixtures';
import { mockCapiFetch } from './mock-capi-fetch';
import { mockRequestEmailHtml } from './mock-fetch-email';
import { mockRequestTestEmailSend } from './mock-request-test-email-send';
import { mockSendNotification } from './mock-send-notification';

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
	includeThumbnail: true,
};

export const populatedPushState: NotificationState = {
	...defaultAppAlertState,
	content: articleFixture,
	fetchedArticleId: articleFixture.id,
};
