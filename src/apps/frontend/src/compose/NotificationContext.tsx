import type { ResolveArticleRequest, ResolveArticleResponse } from '@models';
import type { ActionDispatch } from 'react';
import { createContext } from 'react';
import type { Result } from '../api-client/client';
import { ApiError } from '../api-client/errors';
import type { SendNotificationRequest } from '../schemas';
import type {
	ChannelOption,
	NotificationAction,
	NotificationState,
	RequestEmailHtml,
} from '../types';
import type { SendNotificationResult } from '../utils/send-notification';
import type { TestEmailRequestFunction } from '../utils/send-test-email';

export interface NotificationFormContextProps {
	channel: ChannelOption;
	notification: NotificationState;
	updateNotification: ActionDispatch<[NotificationAction]>;
	capiFetch: {
		(request: ResolveArticleRequest): Promise<Result<ResolveArticleResponse>>;
	};
	// TO DO - get the required payload from the backend
	sendNotification: {
		(
			sendNotificationRequest: SendNotificationRequest,
		): Promise<SendNotificationResult>;
	};
	requestEmailHtml: RequestEmailHtml;
	requestTestEmailSend: TestEmailRequestFunction;
}

export const NotificationFormContext =
	createContext<NotificationFormContextProps>({
		channel: 'email',
		notification: {
			isFetchingContent: false,
			isWaitingForSend: false,
			confirmSendModalOpen: false,
		},
		updateNotification: () => {},
		capiFetch: () =>
			Promise.resolve({
				success: false,
				failure: new ApiError({
					message: 'no capiFetch implementation provided',
					failure: 'fetch-fail',
				}),
			}),
		sendNotification: () =>
			Promise.resolve({
				success: false,
				failure: new ApiError({
					message: 'no sendNotification implementation provided',
					failure: 'fetch-fail',
				}),
			}),
		requestEmailHtml: () =>
			Promise.resolve({
				success: false,
				failure: new ApiError({
					message: 'no requestEmailHtml implementation provided',
					failure: 'fetch-fail',
				}),
			}),
		requestTestEmailSend: () =>
			Promise.resolve({
				success: false,
				failure: new ApiError({
					message: 'no requestTestEmailSend implementation provided',
					failure: 'fetch-fail',
				}),
			}),
	});
