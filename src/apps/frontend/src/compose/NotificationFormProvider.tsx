import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionDispatch, type ReactNode, useReducer } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type {
	ChannelOption,
	NotificationComposerAction,
	NotificationComposerState,
} from '../types';
import { requestEmailHtml } from '../utils/fetch-email-preview';
import {
	defaultAppAlertComposerState,
	defaultComposerState,
	notificationComposerReducer,
} from '../utils/notification-composer-reducer';
import {
	appAlertFormSchema,
	type AppAlertFormValues,
	defaultAppAlertFormValues,
	defaultNewsletterEmailFormValues,
	newsletterEmailFormSchema,
	type NewsletterEmailFormValues,
} from '../utils/notification-forms';
import { resolveArticleFromCapi } from '../utils/resolve-article-from-capi';
import { sendNotification } from '../utils/send-notification';
import { requestTestEmailSend } from '../utils/send-test-email';
import { NotificationFormContext } from './NotificationFormContext';

type NotificationComposer = readonly [
	NotificationComposerState,
	ActionDispatch<[NotificationComposerAction]>,
];

const NotificationFormProvider = ({
	children,
	composer: [composerState, updateComposerState],
	channel,
}: {
	children: ReactNode;
	composer: NotificationComposer;
	channel: ChannelOption;
}) => (
	<NotificationFormContext.Provider
		value={{
			channel,
			composerState,
			updateComposerState,
			resolveArticleFromCapi,
			requestEmailHtml,
			sendNotification,
			requestTestEmailSend,
		}}
	>
		{children}
	</NotificationFormContext.Provider>
);

export const NewsletterEmailNotificationFormProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const newsletterEmailComposer = useReducer<
		NotificationComposerState,
		[NotificationComposerAction]
	>(notificationComposerReducer, defaultComposerState);
	const newsletterEmailForm = useForm<NewsletterEmailFormValues>({
		defaultValues: defaultNewsletterEmailFormValues,
		resolver: zodResolver(newsletterEmailFormSchema),
	});
	return (
		<FormProvider {...newsletterEmailForm}>
			<NotificationFormProvider
				composer={newsletterEmailComposer}
				channel="newsletter"
			>
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
	const appAlertComposer = useReducer<
		NotificationComposerState,
		[NotificationComposerAction]
	>(notificationComposerReducer, defaultAppAlertComposerState);
	const appAlertForm = useForm<AppAlertFormValues>({
		defaultValues: defaultAppAlertFormValues,
		resolver: zodResolver(appAlertFormSchema),
	});
	return (
		<FormProvider {...appAlertForm}>
			<NotificationFormProvider composer={appAlertComposer} channel="app-push">
				{children}
			</NotificationFormProvider>
		</FormProvider>
	);
};
