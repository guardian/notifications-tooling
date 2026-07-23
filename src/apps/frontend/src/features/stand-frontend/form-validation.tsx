import type { NotificationState } from './types';

export const checkIfReadyToSend = (
	notification: NotificationState,
): boolean => {
	const { parameters, fetchedArticleId } = notification;

	if (parameters?.type === 'email') {
		// TO DO - validate in full
		const {
			subject = '',
			preview = '',
			emailDeliveryOption,
			audienceSegments = [],
		} = parameters;
		return (
			!!fetchedArticleId &&
			subject.length > 0 &&
			preview.length > 0 &&
			audienceSegments.length > 0 &&
			!!emailDeliveryOption
		);
	}
	if (parameters?.type === 'push') {
		return false;
	}

	return false;
};

// the path to a guardian article is made up at least two segments, usually in the format
// /section-name/YYYY/MMM/DD/article-headline-converted-to-kebab-case
const articleUrlPathPattern = /^(\/([\w-]+)){2,}$/;

const trimTrailingSlash = (rawPath: string): string =>
	rawPath.endsWith('/') ? rawPath.substring(0, rawPath.length - 1) : rawPath;

const trimLeadingSlash = (rawPath: string): string =>
	rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;

// TO DO - config options to allow use of https://m.code.dev-theguardian.com ?
const hostWhitelist = ['www.theguardian.com'];

export const parseArticleUrlInputToContentId = (
	articleInputText: string,
): { articleId?: string; failure?: string } => {
	if (articleInputText.length === 0) {
		return {};
	}

	try {
		const url = new URL(articleInputText);

		if (!hostWhitelist.includes(url.host)) {
			return {
				failure: 'not a Guardian URL',
			};
		}
		const pathname = trimTrailingSlash(url.pathname);
		if (!articleUrlPathPattern.test(pathname)) {
			return {
				failure: 'not a Guardian article URL',
			};
		}

		// the id of the article is the path with the leading slash removed
		return { articleId: trimLeadingSlash(pathname) };
	} catch {
		// if not a URL, check if the inut is a valid article id
		const maybeInputtedArticleId = trimLeadingSlash(articleInputText);
		if (articleUrlPathPattern.test(`/${maybeInputtedArticleId}`)) {
			return {
				articleId: maybeInputtedArticleId,
			};
		}
		return { failure: 'not valid url' };
	}
};
