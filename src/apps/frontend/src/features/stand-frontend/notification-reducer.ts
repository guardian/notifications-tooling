import { parseHtml } from '../../util/html-helpers';
import type { NotificationAction, NotificationState } from './types';

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

		case 'waiting-for-article': {
			return {
				...state,
				fetchedArticleId: state.articleId,
				isFetchingContent: true,
				fetchArticleError: undefined,
			};
		}

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
	}
};
