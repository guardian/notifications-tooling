import type { NotificationChannel } from '@config';
import { getSSMParameter } from '@config/ssm';
import {
	registerBrazeTestEmailRecipients,
	renderEmail,
	sendAppNotification,
	sendBrazeCampaign,
	sendBrazeTestEmail,
} from '@services';
import type {
	NotificationSendRequest,
	NotificationTestSendRequest,
} from '../routers/notifications/schemas/notification-send-request';

// Each provider request shares a fixed timeout; it is not configurable per
// environment.
export const PROVIDER_REQUEST_TIMEOUT_MS = 10_000;

export type DispatchNotificationDependencies = {
	getSSMParameter: typeof getSSMParameter;
	renderEmail: typeof renderEmail;
	sendAppNotification: typeof sendAppNotification;
	sendBrazeCampaign: typeof sendBrazeCampaign;
	registerBrazeTestEmailRecipients: typeof registerBrazeTestEmailRecipients;
	sendBrazeTestEmail: typeof sendBrazeTestEmail;
};

export const defaultDependencies: DispatchNotificationDependencies = {
	getSSMParameter,
	renderEmail,
	sendAppNotification,
	sendBrazeCampaign,
	registerBrazeTestEmailRecipients,
	sendBrazeTestEmail,
};

export const requireContentItem = (
	request: NotificationSendRequest | NotificationTestSendRequest,
	itemId: string,
	channel: NotificationChannel,
) => {
	const item = request.content.items[itemId];

	if (item?.type !== channel) {
		throw new Error(
			`Content item '${itemId}' is not valid for the '${channel}' channel.`,
		);
	}

	return item;
};
