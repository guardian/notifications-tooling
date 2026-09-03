import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionDispatch, type ReactNode, useReducer } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { requestEmailHtml } from '../preview/fetch-email-preview';
import { sendNotification } from '../send/send-notification';
import { requestTestEmailSend } from '../send/send-test-email';
import type {
	ChannelOption,
	NotificationAction,
	NotificationState,
} from '../types';
import { fetchCapiDataFromApi } from './fetch-capi-content';
import {
	appAlertFormSchema,
	type AppAlertFormValues,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
	newsletterFormSchema,
	type NewsletterFormValues,
} from './notification-forms';
import {
	defaultAppAlertState,
	defaultState,
	notificationReducer,
} from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';

type NotificationDraft = readonly [
	NotificationState,
	ActionDispatch<[NotificationAction]>,
];

const NotificationFormProvider = ({
	children,
	draft: [notification, updateNotification],
	channel,
}: {
	children: ReactNode;
	draft: NotificationDraft;
	channel: ChannelOption;
}) => (
	<NotificationFormContext.Provider
		value={{
			channel,
			notification,
			updateNotification,
			capiFetch: fetchCapiDataFromApi,
			requestEmailHtml,
			sendNotification,
			requestTestEmailSend,
		}}
	>
		{children}
	</NotificationFormContext.Provider>
);

export const NewsletterNotificationFormProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const newsletter = useReducer<NotificationState, [NotificationAction]>(
		notificationReducer,
		defaultState,
	);
	const newsletterForm = useForm<NewsletterFormValues>({
		defaultValues: defaultNewsletterFormValues,
		resolver: zodResolver(newsletterFormSchema),
	});
	return (
		<FormProvider {...newsletterForm}>
			<NotificationFormProvider draft={newsletter} channel="email">
				{children}
			</NotificationFormProvider>
		</FormProvider>
	);
};

export const AppAlertNotificationFormProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const appAlert = useReducer<NotificationState, [NotificationAction]>(
		notificationReducer,
		defaultAppAlertState,
	);
	const appAlertForm = useForm<AppAlertFormValues>({
		defaultValues: defaultAppAlertFormValues,
		resolver: zodResolver(appAlertFormSchema),
	});
	return (
		<FormProvider {...appAlertForm}>
			<NotificationFormProvider draft={appAlert} channel="push">
				{children}
			</NotificationFormProvider>
		</FormProvider>
	);
};
