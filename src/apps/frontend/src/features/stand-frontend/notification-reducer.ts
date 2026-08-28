import type { NotificationAction, NotificationState } from './types';

export const defaultState: NotificationState = {
	isFetchingContent: false,
	isWaitingForSend: false,
	confirmSendModalOpen: false,
};

export const defaultAppAlertState: NotificationState = {
	isFetchingContent: false,
	isWaitingForSend: false,
	confirmSendModalOpen: false,
};

export const notificationReducer = (
	prevState: NotificationState,
	action: NotificationAction,
): NotificationState => {
	const state = structuredClone(prevState);
	switch (action.type) {
		case 'waiting-for-article':
			return {
				...state,
				isFetchingContent: true,
				fetchArticleError: undefined,
			};

		case 'receive-article': {
			return {
				...state,
				fetchedArticleId: action.content.id,
				content: action.content,
				isFetchingContent: false,
				fetchArticleError: undefined,
			};
		}

		case 'report-article-error': {
			return {
				...state,
				fetchedArticleId: undefined,
				content: undefined,
				isFetchingContent: false,
				fetchArticleError: action.errorMessage,
			};
		}

		case 'set-thumbnail-image': {
			if (state.content?.id !== action.contentId) {
				return state;
			}
			return {
				...state,
				content: {
					...state.content,
					fields: {
						...state.content.fields,
						thumbnail: action.thumbnail,
					},
				},
			};
		}

		case 'set-show-confirm-send': {
			state.confirmSendModalOpen = action.isOpen;
			return state;
		}

		case 'prepare-send': {
			return {
				...state,
				confirmSendModalOpen: true,
				pendingRequest: action.request,
			};
		}

		case 'waiting-for-send': {
			return {
				...state,
				isWaitingForSend: true,
			};
		}

		case 'receive-send-result': {
			return {
				...state,
				isWaitingForSend: false,
				confirmSendModalOpen: false,
				sendingResult: action.result,
			};
		}

		case 'reset-newsletter-email': {
			if (state.isFetchingContent || state.isWaitingForSend) {
				return state;
			}
			return structuredClone(defaultState);
		}

		case 'reset-app-alert': {
			if (state.isFetchingContent || state.isWaitingForSend) {
				return state;
			}
			return structuredClone(defaultAppAlertState);
		}

		case 'dismiss-send-error': {
			if (state.sendingResult?.success !== false) {
				return state;
			}
			return {
				...state,
				sendingResult: undefined,
			};
		}
	}
};
