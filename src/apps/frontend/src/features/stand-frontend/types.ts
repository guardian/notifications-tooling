import type { Content } from '@guardian/content-api-models/v1/content';

export type UserData = {
	firstName?: string;
	lastName?: string;
	email: string;
	avatarUrl?: string;
	permissions: Record<string, boolean>;
};

export type TabName = 'create' | 'history';

export type ChannelOption = 'email' | 'push';
export const channelOptionNameMap: Record<
	'email', // for phase one, email is the only supported channel
	{ name: string; description: string }
> = {
	email: {
		name: 'Newsletter email',
		description: 'Sends via the braze breaking-news campaign',
	},
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

export type KickerId = 'breaking-news' | 'exclusive';
export const kickerNameMap: Record<KickerId | 'undefined', string> = {
	'breaking-news': 'Breaking News',
	exclusive: 'Exclusive',
	undefined: 'None',
};

export type AudienceSegment = 'UK' | 'US' | 'AU';
export const audienceSegmentNameMap: Record<AudienceSegment, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
};

export type EmailDeliveryOption = 'immediate';
export const emailDeliveryOptionNameMap: Record<
	EmailDeliveryOption,
	{ name: string; description: string }
> = {
	immediate: {
		name: 'Immediate',
		description: 'Sends right now via Braze',
	},
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
