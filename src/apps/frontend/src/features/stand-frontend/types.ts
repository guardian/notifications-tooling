import type { Content } from '@guardian/content-api-models/v1/content';

export type TabName = 'create' | 'history';
export type ChannelOption = 'email' | 'push';
export type KickerId = 'breaking-news' | 'exclusive';
export type AudienceSegment = 'UK' | 'US' | 'AU';
export type EmailDeliveryOption = 'immediate';

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
	confirmSendModalOpen: boolean;
	isWaitingForSend: boolean;
	sendingResult?: SendingResult;
};

export type SendError =
	| 'insufficient_permissions'
	| 'bad_request'
	| 'validation_failed'
	| 'unauthenticated';
// TO DO - get shape form backend project when ready
export type SendingResult =
	| {
			ok: true;
			response: {
				status: 'accepted';
			};
	  }
	| {
			ok: false;
			response: {
				error: SendError;
				message: string;
			};
			requestFailed?: false;
	  }
	| {
			ok: false;
			requestFailed: true;
			response?: undefined;
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
