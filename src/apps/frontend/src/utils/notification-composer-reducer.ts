import type {
	NotificationComposerAction,
	NotificationComposerState,
} from '../types';

export const defaultComposerState: NotificationComposerState = {
	isFetchingArticle: false,
	isWaitingForSend: false,
	isSendConfirmationOpen: false,
};

export const defaultAppAlertComposerState: NotificationComposerState = {
	isFetchingArticle: false,
	isWaitingForSend: false,
	isSendConfirmationOpen: false,
};

export const notificationComposerReducer = (
	prevState: NotificationComposerState,
	action: NotificationComposerAction,
): NotificationComposerState => {
	const state = structuredClone(prevState);
	switch (action.type) {
		case 'waiting-for-article':
			return {
				...state,
				isFetchingArticle: true,
				fetchArticleError: undefined,
			};

		case 'receive-article': {
			return {
				...state,
				fetchedArticleId: action.article.id,
				article: action.article,
				requestedUrl: action.requestedUrl,
				requestedBlock: action.requestedBlock,
				isFetchingArticle: false,
				fetchArticleError: undefined,
			};
		}

		case 'report-article-error': {
			return {
				...state,
				fetchedArticleId: undefined,
				article: undefined,
				requestedUrl: undefined,
				requestedBlock: undefined,
				isFetchingArticle: false,
				fetchArticleError: action.errorMessage,
			};
		}

		case 'set-send-confirmation-open': {
			state.isSendConfirmationOpen = action.isOpen;
			return state;
		}

		case 'prepare-send': {
			return {
				...state,
				isSendConfirmationOpen: true,
				pendingRequest: action.request,
			};
		}

		case 'waiting-for-send': {
			return {
				...state,
				isWaitingForSend: true,
			};
		}

		case 'receive-send-failure': {
			return {
				...state,
				isWaitingForSend: false,
				isSendConfirmationOpen: false,
				sendFailure: action.failure,
			};
		}

		case 'complete-send': {
			return structuredClone(defaultComposerState);
		}

		case 'reset-newsletter-email': {
			if (state.isFetchingArticle || state.isWaitingForSend) {
				return state;
			}
			return structuredClone(defaultComposerState);
		}

		case 'reset-app-alert': {
			if (state.isFetchingArticle || state.isWaitingForSend) {
				return state;
			}
			return structuredClone(defaultAppAlertComposerState);
		}

		case 'dismiss-send-error': {
			if (!state.sendFailure) {
				return state;
			}
			return {
				...state,
				sendFailure: undefined,
			};
		}
	}
};
