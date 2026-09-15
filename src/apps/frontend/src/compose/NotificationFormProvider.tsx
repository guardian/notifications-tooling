import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionDispatch, type ReactNode, useReducer } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type {
	ChannelOption,
	NotificationAction,
	NotificationState,
} from '../types';
import { fetchCapiDataFromApi } from '../utils/fetch-capi-content';
import { requestEmailHtml } from '../utils/fetch-email-preview';
import {
	appAlertFormSchema,
	type AppAlertFormValues,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
	newsletterFormSchema,
	type NewsletterFormValues,
} from '../utils/notification-forms';
import {
	defaultAppAlertState,
	defaultState,
	notificationReducer,
} from '../utils/notification-reducer';
import { sendNotification } from '../utils/send-notification';
import { requestTestEmailSend } from '../utils/send-test-email';
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
