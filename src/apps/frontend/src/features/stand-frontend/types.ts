export type UserData = {
	firstName?: string;
	lastName?: string;
	email: string;
	avatarUrl?: string;
	permissions: Record<string, boolean>;
};

export type TabName = 'create' | 'history';

export type NotificationState = {
	articleId?: string;
	content?: Record<string, unknown>;
	parameters?: EmailNotification | PushNotification;
};

export type EmailNotification = {
	type: 'email';
	kicker?: 'breaking-news' | 'exclusive';
	subject?: string;
	preview?: string;
};

export type PushNotification = {
	type: 'push';
};

export type NotificationAction =
	| {
			type: 'set-article-id';
			text: string;
	  }
	| {
			type: 'modify-email-parameters';
			mod: Partial<EmailNotification>;
	  };
