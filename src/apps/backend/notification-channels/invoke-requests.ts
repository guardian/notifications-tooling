import type { MockAppNotificationClient } from './app-notification/client';
import type { BrazeClient } from './email/braze/client';
import type { GeneratedNotificationChannelRequest } from './generate-requests';

export type NotificationChannelClients = {
	braze: BrazeClient;
	appNotification: MockAppNotificationClient;
};

export type NotificationChannelInvocationResult =
	| {
			channel: 'email';
			status: 'sent';
			dispatchId?: string;
	  }
	| {
			channel: 'app-notification';
			status: 'mocked';
	  };

export const invokeNotificationChannelRequest = async (
	generatedRequest: GeneratedNotificationChannelRequest,
	clients: NotificationChannelClients,
): Promise<NotificationChannelInvocationResult> => {
	switch (generatedRequest.channel) {
		case 'email': {
			const response = await clients.braze.triggerCampaign(
				generatedRequest.request,
			);

			return {
				channel: 'email',
				status: 'sent',
				dispatchId: response.dispatch_id,
			};
		}
		case 'app-notification':
			return {
				channel: 'app-notification',
				...(await clients.appNotification.send(generatedRequest.request)),
			};
	}
};

export const invokeNotificationChannelRequests = (
	generatedRequests: readonly GeneratedNotificationChannelRequest[],
	clients: NotificationChannelClients,
): Promise<NotificationChannelInvocationResult[]> =>
	Promise.all(
		generatedRequests.map((request) =>
			invokeNotificationChannelRequest(request, clients),
		),
	);
