import { zodResolver } from '@hookform/resolvers/zod';
import {
	type ActionDispatch,
	createContext,
	type ReactNode,
	useContext,
	useReducer,
} from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { fetchCapiDataFromApi } from './api/fetch-capi-content';
import { requestEmailHtml } from './api/fetch-email-preview';
import { sendNotification } from './api/send-notification';
import { requestTestEmailSend } from './api/send-test-email';
import {
	APP_ALERT_LIMIT_FALLBACKS,
	NEWSLETTER_LIMIT_FALLBACKS,
	useChannelConstraints,
} from './api/useChannelConstraints';
import {
	type AppAlertFormValues,
	createAppAlertFormSchema,
	createNewsletterFormSchema,
	defaultAppAlertFormValues,
	defaultNewsletterFormValues,
	type NewsletterFormValues,
} from './notification-forms';
import {
	defaultAppAlertState,
	defaultState,
	notificationReducer,
} from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type {
	ChannelOption,
	NotificationAction,
	NotificationState,
} from './types';

type NotificationDraft = readonly [
	NotificationState,
	ActionDispatch<[NotificationAction]>,
];

const NotificationDraftsContext = createContext<
	| {
			newsletter: NotificationDraft;
			appAlert: NotificationDraft;
			newsletterForm: UseFormReturn<NewsletterFormValues>;
			appAlertForm: UseFormReturn<AppAlertFormValues>;
	  }
	| undefined
>(undefined);

export const NotificationDraftsProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const { data: constraints } = useChannelConstraints();
	const newsletter = useReducer<NotificationState, [NotificationAction]>(
		notificationReducer,
		defaultState,
	);
	const appAlert = useReducer<NotificationState, [NotificationAction]>(
		notificationReducer,
		defaultAppAlertState,
	);
	const newsletterLimits = constraints?.channels.newsletter;
	const appAlertLimits = constraints?.channels['app-push'];
	const newsletterForm = useForm<NewsletterFormValues>({
		defaultValues: defaultNewsletterFormValues,
		resolver: zodResolver(
			createNewsletterFormSchema({
				subject:
					newsletterLimits?.compose.subject.editorialLimit ??
					NEWSLETTER_LIMIT_FALLBACKS.title.editorialLimit,
				preview:
					newsletterLimits?.content.body.editorialLimit ??
					NEWSLETTER_LIMIT_FALLBACKS.body.editorialLimit,
			}),
		),
	});
	const appAlertForm = useForm<AppAlertFormValues>({
		defaultValues: defaultAppAlertFormValues,
		resolver: zodResolver(
			createAppAlertFormSchema({
				headline:
					appAlertLimits?.compose.headline.editorialLimit ??
					APP_ALERT_LIMIT_FALLBACKS.headline.editorialLimit,
			}),
		),
	});

	return (
		<NotificationDraftsContext.Provider
			value={{ newsletter, appAlert, newsletterForm, appAlertForm }}
		>
			{children}
		</NotificationDraftsContext.Provider>
	);
};

const useNotificationDrafts = () => {
	const drafts = useContext(NotificationDraftsContext);
	if (!drafts) {
		throw new Error(
			'Notification form providers must be inside NotificationDraftsProvider',
		);
	}
	return drafts;
};

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
	const { newsletter, newsletterForm } = useNotificationDrafts();
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
	const { appAlert, appAlertForm } = useNotificationDrafts();
	return (
		<FormProvider {...appAlertForm}>
			<NotificationFormProvider draft={appAlert} channel="push">
				{children}
			</NotificationFormProvider>
		</FormProvider>
	);
};
