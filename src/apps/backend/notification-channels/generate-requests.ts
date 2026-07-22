import {
	type AppNotificationRequest,
	generateAppNotificationRequest,
} from './app-notification/generate-request';
import {
	type AudienceSegment,
	type BrazeCampaignIds,
	resolveBrazeCampaignId,
} from './email/braze/campaigns';
import {
	type BrazeCampaignTriggerRequest,
	generateBrazeEmailRequest,
} from './email/braze/generate-request';

export type NotificationChannelRequestInput =
	| {
			channel: 'email';
			audienceSegment: AudienceSegment;
			html: string;
			subject: string;
	  }
	| {
			channel: 'app-notification';
			request: AppNotificationRequest;
	  };

export type NotificationChannelConfig = {
	brazeCampaignIds: BrazeCampaignIds;
};

export type GeneratedNotificationChannelRequest =
	| {
			channel: 'email';
			status: 'generated';
			request: BrazeCampaignTriggerRequest;
	  }
	| {
			channel: 'app-notification';
			status: 'not_implemented';
			request: AppNotificationRequest;
	  };

export const generateNotificationChannelRequest = (
	input: NotificationChannelRequestInput,
	config: NotificationChannelConfig,
): GeneratedNotificationChannelRequest => {
	switch (input.channel) {
		case 'email':
			return {
				channel: 'email',
				status: 'generated',
				request: generateBrazeEmailRequest({
					campaignId: resolveBrazeCampaignId(
						input.audienceSegment,
						config.brazeCampaignIds,
					),
					html: input.html,
					subject: input.subject,
				}),
			};
		case 'app-notification':
			return {
				channel: 'app-notification',
				...generateAppNotificationRequest(input.request),
			};
	}
};

export const generateNotificationChannelRequests = (
	inputs: readonly NotificationChannelRequestInput[],
	config: NotificationChannelConfig,
): GeneratedNotificationChannelRequest[] =>
	inputs.map((input) => generateNotificationChannelRequest(input, config));
