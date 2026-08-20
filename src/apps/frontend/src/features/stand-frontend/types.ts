import type {
	EmailPreviewRequest,
	EmailPreviewResponse,
	ResolvedArticle,
} from '@models';
import type { ApiError } from '../../api/errors';
import type { SendNotificationResponse } from './api/schemas';

export type TabName = 'create' | 'history';
export type ChannelOption = 'email' | 'push';
export type KickerId = 'breaking-news' | 'exclusive';
export type AlertType =
	'breaking-news' | 'sport' | 'editors-picks' | 'one-not-to-miss';
export type DeliveryOption = 'immediate' | 'appImmediate';
export type AudienceSegment = 'UK' | 'US' | 'AU';
export type Edition = 'UK' | 'US' | 'AU' | 'EU' | 'INT';

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
	emailDeliveryOption?: DeliveryOption;
};

export type PushNotification = {
	type: 'push';
	alertType?: AlertType;
	headline?: string;
	pushDeliveryOption?: DeliveryOption;
	editions?: Edition[];
};

export type NotificationState = {
	isFetchingContent: boolean;
	fetchedArticleId?: string;
	fetchArticleError?: string;
	content?: ResolvedArticle;
	parameters?: EmailNotification | PushNotification;
	hasAttemptedSend: boolean;
	confirmSendModalOpen: boolean;
	isWaitingForSend: boolean;
	sendingResult?: SendingResult;
};

export type RequestEmailHtml = {
	(request: EmailPreviewRequest): Promise<EmailPreviewResponse>;
};

export type NotificationAction =
	| {
			type: 'set-channel';
			channel: ChannelOption;
	  }
	| {
			type: 'set-delivery-timing';
			deliveryOption: DeliveryOption;
	  }
	| {
			type: 'modify-email-parameters';
			mod: Partial<EmailNotification>;
	  }
	| {
			type: 'modify-app-alert-parameters';
			appMod: Partial<PushNotification>;
	  }
	| {
			type: 'waiting-for-article';
	  }
	| {
			type: 'receive-article';
			content: ResolvedArticle;
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
			type: 'reset-newsletter-email';
	  }
	| {
			type: 'reset-app-alert';
	  };
