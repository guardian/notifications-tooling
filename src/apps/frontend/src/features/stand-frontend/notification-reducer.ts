import { htmlToSingleLineText } from '../../util/html-helpers';
import type {
	EmailNotification,
	NotificationAction,
	NotificationState,
	PushNotification,
} from './types';

export const defaultEmailParams: EmailNotification = {
	type: 'email',
	kicker: 'breaking-news',
	emailDeliveryOption: 'immediate',
};

export const defaultPushParams: PushNotification = {
	type: 'push',
};

export const defaultState: NotificationState = {
	isFetchingContent: false,
	isWaitingForSend: false,
	hasAttemptedSend: false,
	confirmSendModalOpen: false,
	activeSection: '#article-section',
	parameters: defaultEmailParams,
};

export const notificationReducer = (
	prevState: NotificationState,
	action: NotificationAction,
): NotificationState => {
	const state = structuredClone(prevState);
	switch (action.type) {
		case 'modify-email-parameters': {
			if (state.parameters?.type !== 'email') {
				return state;
			}
			return {
				...state,
				parameters: { ...state.parameters, ...action.mod },
			};
		}

		case 'set-channel': {
			switch (action.channel) {
				case 'email':
					return {
						...state,
						hasAttemptedSend: false,
						parameters: defaultEmailParams,
					};
				case 'push': {
					return {
						...state,
						hasAttemptedSend: false,
						parameters: defaultPushParams,
					};
				}
			}
		}

		// eslint-disable-next-line no-fallthrough -- previous case has exhaustive switch
		case 'set-attempted-send': {
			return {
				...state,
				hasAttemptedSend: action.hasAttemptedSend,
			};
		}

		case 'waiting-for-article':
			return {
				...state,
				isFetchingContent: true,
				fetchArticleError: undefined,
			};

		case 'receive-article': {
			const { parameters } = state;
			const { headline, standfirst } = action.content.fields ?? {};

			if (parameters?.type === 'email') {
				const standfirstText = htmlToSingleLineText(standfirst);
				parameters.preview = standfirstText || parameters.preview;
				parameters.subject = headline ?? parameters.subject;
			}

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
				isFetchingContent: false,
				fetchArticleError: action.errorMessage,
			};
		}

		case 'set-show-confirm-send': {
			state.confirmSendModalOpen = action.isOpen;
			return state;
		}

		case 'waiting-for-send': {
			return {
				...state,
				isWaitingForSend: true,
				hasAttemptedSend: false,
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

		case 'reset': {
			if (state.isFetchingContent || state.isWaitingForSend) {
				return state;
			}
			return structuredClone(defaultState);
		}

		case 'dismiss-send-error': {
			if (state.sendingResult?.ok !== false) {
				return state;
			}
			return {
				...state,
				sendingResult: undefined,
			};
		}

		case 'set-active-section': {
			return { ...state, activeSection: action.text };
		}
	}
};
