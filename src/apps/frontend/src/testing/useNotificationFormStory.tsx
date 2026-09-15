import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useReducer } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import type { NotificationFormContextProps } from '../compose/NotificationFormContext';
import { NotificationFormContext } from '../compose/NotificationFormContext';
import type {
	ChannelOption,
	NotificationComposerAction,
	NotificationComposerState,
} from '../types';
import {
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
import { mockRequestEmailHtml } from './mock-fetch-email';
import { mockRequestTestEmailSend } from './mock-request-test-email-send';
import { mockResolveArticle } from './mock-resolve-article';
import { mockSendNotification } from './mock-send-notification';

export const useNotificationFormStory = (
	reactNode: ReactNode,
	composerState: NotificationComposerState = defaultComposerState,
	functions: Partial<
		Omit<
			NotificationFormContextProps,
			'channel' | 'composerState' | 'dispatchComposerAction'
		>
	> = {},
	channel: ChannelOption = 'newsletter',
	formValues?: Partial<NewsletterEmailFormValues> | Partial<AppAlertFormValues>,
) => {
	const [currentComposerState, dispatchComposerAction] = useReducer<
		NotificationComposerState,
		[NotificationComposerAction]
	>(notificationComposerReducer, composerState);
	const newsletterEmailValues =
		channel === 'newsletter'
			? (formValues as Partial<NewsletterEmailFormValues> | undefined)
			: undefined;
	const appAlertValues =
		channel === 'app-push'
			? (formValues as Partial<AppAlertFormValues> | undefined)
			: undefined;
	const newsletterEmailForm = useForm({
		defaultValues: {
			...defaultNewsletterEmailFormValues,
			...newsletterEmailValues,
		},
		resolver: zodResolver(newsletterEmailFormSchema),
	});
	const appAlertForm = useForm({
		defaultValues: {
			...defaultAppAlertFormValues,
			...appAlertValues,
		},
		resolver: zodResolver(appAlertFormSchema),
	});

	const {
		resolveArticle = mockResolveArticle,
		sendNotification = mockSendNotification,
		requestEmailHtml = mockRequestEmailHtml,
		requestTestEmailSend = mockRequestTestEmailSend,
	} = functions;

	const context = (
		<NotificationFormContext
			value={{
				channel,
				composerState: currentComposerState,
				dispatchComposerAction,
				resolveArticle,
				sendNotification,
				requestEmailHtml,
				requestTestEmailSend,
			}}
		>
			{reactNode}
		</NotificationFormContext>
	);

	return channel === 'newsletter' ? (
		<FormProvider {...newsletterEmailForm}>{context}</FormProvider>
	) : (
		<FormProvider {...appAlertForm}>{context}</FormProvider>
	);
};
