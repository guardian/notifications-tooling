import type { NotificationState } from './types';

export type NotificationFormErrorField =
	'article' | 'subject' | 'preview' | 'audienceSegments';

export type NotificationFormErrors = NotificationFormErrorField[];

export const validateNotificationForm = (
	notification: NotificationState,
): NotificationFormErrors => {
	const { content, parameters } = notification;

	if (parameters?.type !== 'email') {
		return [];
	}

	const { subject = '', preview = '', audienceSegments = [] } = parameters;
	const errors: NotificationFormErrors = [];

	if (content?.id === undefined) {
		errors.push('article');
	}
	if (subject.trim().length === 0) {
		errors.push('subject');
	}
	if (preview.trim().length === 0) {
		errors.push('preview');
	}
	if (audienceSegments.length === 0) {
		errors.push('audienceSegments');
	}

	return errors;
};

export const checkIfReadyToSend = (
	notification: NotificationState,
): boolean => {
	const { parameters } = notification;

	if (parameters?.type === 'email') {
		const errors = validateNotificationForm(notification);
		return errors.length === 0;
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
