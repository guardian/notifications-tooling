import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useReducer } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
	type AppAlertFormValues,
	createAppAlertFormSchema,
	createNewsletterFormSchema,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
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
import { channelConstraints } from '../mocks/handlers/channels';
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
	const newsletterConstraints = channelConstraints.channels.newsletter;
	const appAlertConstraints = channelConstraints.channels['app-push'];
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
		resolver: zodResolver(
			createNewsletterFormSchema({
				subject: newsletterConstraints.compose.subject.validationCap,
				preview: newsletterConstraints.content.body.validationCap,
			}),
		),
	});
	const appAlertForm = useForm({
		defaultValues: {
			...defaultAppAlertFormValues,
			...appAlertValues,
		},
		resolver: zodResolver(
			createAppAlertFormSchema({
				headline: appAlertConstraints.content.body.validationCap,
			}),
		),
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
