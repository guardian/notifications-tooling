import type {
	CapiBlock,
	EmailPreviewRequest,
	EmailPreviewResponse,
	ResolvedArticle,
} from '@models';
import type { Result } from './api-client/client';
import type { SendNotificationRequest } from './schemas';
import type { SendNotificationFailure } from './utils/send-notification';

export type ChannelOption = 'newsletter' | 'app-push';
export type DeliveryOption = 'immediate' | 'appImmediate';

export type NotificationComposerState = {
	isFetchingArticle: boolean;
	fetchedArticleId?: string;
	fetchArticleError?: string;
	article?: ResolvedArticle;
	requestedUrl?: string;
	requestedBlock?: CapiBlock;
	isSendConfirmationOpen: boolean;
	isWaitingForSend: boolean;
	sendFailure?: SendNotificationFailure;
	pendingRequest?: SendNotificationRequest;
};

export type RequestEmailHtml = {
	(request: EmailPreviewRequest): Promise<Result<EmailPreviewResponse>>;
};

export type NotificationComposerAction =
	| {
			type: 'waiting-for-article';
	  }
	| {
			type: 'receive-article';
			article: ResolvedArticle;
			requestedUrl?: string;
			requestedBlock?: CapiBlock;
	  }
	| {
			type: 'report-article-error';
			errorMessage: string;
	  }
	| {
			type: 'set-send-confirmation-open';
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
			type: 'receive-send-failure';
			failure: SendNotificationFailure;
	  }
	| {
			type: 'complete-send';
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
