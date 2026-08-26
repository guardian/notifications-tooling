import type {
	EmailPreviewRequest,
	EmailPreviewResponse,
	NewsletterSegmentId,
	ResolvedArticle,
} from '@models';
import type { Result } from '../../api/client';
import type { ApiError } from '../../api/errors';
import type {
	SendNotificationRequest,
	SendNotificationResponse,
} from './api/schemas';

export type TabName = 'create' | 'history';
export type ChannelOption = 'email' | 'push';
export type KickerId = 'breaking-news' | 'exclusive';
export type AlertType =
	'breaking-news' | 'sport' | 'editors-picks' | 'one-not-to-miss';
export type DeliveryOption = 'immediate' | 'appImmediate';
export type Edition = 'UK' | 'US' | 'AU' | 'EU' | 'INT';

export type EmailNotification = {
	type: 'email';
	kicker?: KickerId;
	subject?: string;
	preview?: string;
	emailHtml?: string;
	audienceSegments?: NewsletterSegmentId[];
	emailDeliveryOption?: DeliveryOption;
};

export type PushNotification = {
	type: 'push';
	alertType?: AlertType;
	headline?: string;
	pushDeliveryOption?: DeliveryOption;
	editions?: Edition[];
};
export type SendingResult =
	| {
			ok: true;
			response: SendNotificationResponse;
	  }
	| {
			ok: false;
			response: ApiError;
	  };

export type NotificationState = {
	isFetchingContent: boolean;
	fetchedArticleId?: string;
	fetchArticleError?: string;
	content?: ResolvedArticle;
	confirmSendModalOpen: boolean;
	isWaitingForSend: boolean;
	sendingResult?: Result<SendNotificationResponse>;
	pendingRequest?: SendNotificationRequest;
};

export type RequestEmailHtml = {
	(request: EmailPreviewRequest): Promise<Result<EmailPreviewResponse>>;
};

export type NotificationAction =
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
			type: 'prepare-send';
			request: SendNotificationRequest;
	  }
	| {
			type: 'waiting-for-send';
	  }
	| {
			type: 'receive-send-result';
			result: Result<SendNotificationResponse>;
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
