import {
	type ActionDispatch,
	createContext,
	type ReactNode,
	useContext,
	useReducer,
} from 'react';
import { fetchCapiDataFromApi } from './api/fetch-capi-content';
import { requestEmailHtml } from './api/fetch-email-preview';
import { sendNotification } from './api/send-notification';
import { requestTestEmailSend } from './api/send-test-email';
import {
	defaultAppAlertState,
	defaultState,
	notificationReducer,
} from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState } from './types';

type NotificationDraft = readonly [
	NotificationState,
	ActionDispatch<[NotificationAction]>,
];

const NotificationDraftsContext = createContext<
	| {
			newsletter: NotificationDraft;
			appAlert: NotificationDraft;
	  }
	| undefined
>(undefined);

export const NotificationDraftsProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const newsletter = useReducer<NotificationState, [NotificationAction]>(
		notificationReducer,
		defaultState,
	);
	const appAlert = useReducer<NotificationState, [NotificationAction]>(
		notificationReducer,
		defaultAppAlertState,
	);

	return (
		<NotificationDraftsContext.Provider value={{ newsletter, appAlert }}>
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
}: {
	children: ReactNode;
	draft: NotificationDraft;
}) => (
	<NotificationFormContext.Provider
		value={{
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
	const { newsletter } = useNotificationDrafts();
	return (
		<NotificationFormProvider draft={newsletter}>
			{children}
		</NotificationFormProvider>
	);
};

export const AppAlertNotificationFormProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const { appAlert } = useNotificationDrafts();
	return (
		<NotificationFormProvider draft={appAlert}>
			{children}
		</NotificationFormProvider>
	);
};
