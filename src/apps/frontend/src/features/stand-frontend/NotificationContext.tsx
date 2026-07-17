import type { ActionDispatch } from 'react';
import { createContext } from 'react';
import type { NotificationAction, NotificationState } from './types';

export const NotificationContext = createContext<{
	notification: NotificationState;
	updateNotification: ActionDispatch<[NotificationAction]>;
}>({ notification: {}, updateNotification: () => {} });
