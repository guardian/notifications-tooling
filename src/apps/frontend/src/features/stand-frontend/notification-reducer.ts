import { parseHtml } from '../../util/html-helpers';
import type {
	EmailNotification,
	NotificationAction,
	NotificationState,
} from './types';

export const defaultEmailParams: EmailNotification = {
	type: 'email',
	kicker: 'breaking-news',
	emailDeliveryOption: 'immediate',
};

export const defaultState: NotificationState = {
	isFetchingContent: false,
	isWaitingForSend: false,
	confirmSendModalOpen: false,
	parameters: defaultEmailParams,
};

export const notificationReducer = (
	prevState: NotificationState,
	action: NotificationAction,
): NotificationState => {
	const state = structuredClone(prevState);
	switch (action.type) {
		case 'set-article-id': {
			return { ...state, articleId: action.text };
		}

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
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- will add more
				case 'email':
					return {
						...state,
						parameters: defaultEmailParams,
					};
			}
			return state
		}

		case 'waiting-for-article':
			return {
				...state,
				fetchedArticleId: state.articleId,
				isFetchingContent: true,
				fetchArticleError: undefined,
			};


		case 'receive-article': {
			const { parameters } = state;
			const { headline, standfirst } = action.content.fields ?? {};

			if (parameters?.type === 'email') {
				const standfirstParse = parseHtml(standfirst);
				const shouldUseStandFirst =
					standfirstParse.textContent.length > 0 &&
					!standfirstParse.containsLinks;
				parameters.preview = shouldUseStandFirst
					? standfirstParse.textContent
					: parameters.preview;
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
				sendingResult: undefined,
			};
		}

		case 'receive-send-result': {
			return {
				...state,
				isWaitingForSend: false,
				sendingResult: action.result,
			};
		}

		case 'reset': {
			if (state.isFetchingContent || state.isWaitingForSend) {
				return state;
			}
			return structuredClone(defaultState);
		}
	}
};
