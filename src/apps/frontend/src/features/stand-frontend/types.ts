import type { Content } from '@guardian/content-api-models/v1/content';

export type User = {
	firstName: string;
	lastName: string;
	email: string;
	/** Optional profile picture URL; absent when the provider supplies none. */
	avatarUrl?: string;
	/** The app that issued the login. */
	authenticatingSystem: string;
	/** The apps the user has been validated in. */
	authenticatedIn: string[];
	/** Cookie expiry as epoch milliseconds. */
	expires: number;
	/** Whether the login was made with multi-factor authentication. */
	multifactor: boolean;
};

export interface Permission {
	/** The permission name, e.g. `DispatchAccess`. */
	name: string;
	/** Human-readable description of what the permission grants. */
	description: string;
	/** Whether the permission is currently granted to the user. */
	active: boolean;
}

export interface UserResponse {
	user: User;
	permissions: Permission[];
}

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

// TO DO - get shape form backend project when ready
export type SendingResult = {
	ok: boolean;
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
			type: 'reset';
	  };
