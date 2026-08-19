import { type ReactNode, useReducer } from 'react';
import { fetchCapiDataFromApi } from './api/fetch-capi-content';
import { requestEmailHtml } from './api/fetch-email-preview';
import { sendNotification } from './api/send-notification';
import { requestTestEmailSend } from './api/send-test-email';
import { notificationReducer } from './notification-reducer';
import { NotificationFormContext } from './NotificationContext';
import type { NotificationAction, NotificationState } from './types';

export const NotificationFormProvider = ({
    children,
    initialNotification,
}: {
    children: ReactNode;
    initialNotification: NotificationState;
}) => {
    const [notification, updateNotification] = useReducer<
        NotificationState,
        [NotificationAction]
    >(notificationReducer, initialNotification);

    return (
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
};