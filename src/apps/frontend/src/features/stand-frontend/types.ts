export type UserData = {
	firstName?: string;
	lastName?: string;
	email: string;
	avatarUrl?: string;
	permissions: Record<string, boolean>;
};

export type CapiContent = Record<string, unknown> & { id: string };

export type TabName = 'create' | 'history';

export type NotificationState = {
	articleId?: string;
	isFetchingContent?: boolean;
	fetchedArticleId?: string;
	fetchArticleError?: string;
	content?: CapiContent;
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
	  }
	| {
			type: 'waiting-for-article';
	  }
	| {
			type: 'receive-article';
			content: CapiContent;
	  }
	| {
			type: 'report-article-error';
			errorMessage: string;
	  };
