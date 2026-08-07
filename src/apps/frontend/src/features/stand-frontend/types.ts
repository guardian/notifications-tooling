import type { Content } from '@guardian/content-api-models/v1/content';
import type { ApiError } from '../../api/errors';
import type { SendNotificationResponse } from './api/schemas';

export type TabName = 'create' | 'history';
export type ChannelOption = 'email' | 'push';
export type KickerId = 'breaking-news' | 'exclusive';
export type EmailDeliveryOption = 'immediate';
export type AudienceSegment = 'UK' | 'US' | 'AU';

export type SendingResult =
	| {
			ok: true;
			response: SendNotificationResponse;
	  }
	| {
			ok: false;
			response: ApiError;
	  };

export type EmailNotification = {
	type: 'email';
	kicker?: KickerId;
	subject?: string;
	preview?: string;
	emailHtml?: string;
	audienceSegments?: AudienceSegment[];
	emailDeliveryOption?: EmailDeliveryOption;
};

export type PushNotification = {
	type: 'push';
	audienceSegments?: AudienceSegment[];
};

export type NotificationState = {
	articleInputText?: string;
	isFetchingContent: boolean;
	fetchedArticleId?: string;
	fetchArticleError?: string;
	content?: Content;
	parameters?: EmailNotification | PushNotification;
	hasAttemptedSend: boolean;
	confirmSendModalOpen: boolean;
	isWaitingForSend: boolean;
	sendingResult?: SendingResult;
};

export type RequestEmailHtml = {
	(articleId: string, options: { audience: string }): Promise<string>;
};

export type NotificationAction =
	| {
			type: 'set-article-id';
			text: string;
	  }
	| {
			type: 'set-channel';
			channel: ChannelOption;
	  }
	| {
			type: 'modify-email-parameters';
			mod: Partial<EmailNotification>;
	  }
	| {
			type: 'waiting-for-article';
	  }
	| {
			type: 'receive-article';
			content: Content;
	  }
	| {
			type: 'report-article-error';
			errorMessage: string;
	  }
	| {
			type: 'set-show-confirm-send';
			isOpen: boolean;
	  }
	| {
			type: 'set-attempted-send';
			hasAttemptedSend: boolean;
	  }
	| {
			type: 'waiting-for-send';
	  }
	| {
			type: 'receive-send-result';
			result: SendingResult;
	  }
	| {
			type: 'dismiss-send-error';
	  }
	| {
			type: 'reset';
	  };
