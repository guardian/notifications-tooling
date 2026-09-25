import type { NotificationComposerState } from '../types';
import { htmlToSingleLineText } from '../utils/html-helpers';
import {
	defaultAppAlertComposerState,
	defaultComposerState,
} from '../utils/notification-composer-reducer';
import type {
	AppAlertFormValues,
	NewsletterEmailFormValues,
} from '../utils/notification-forms';
import { articleFixture } from './capi-fixtures';

export const completeNewsletterEmailFormValues: NewsletterEmailFormValues = {
	kicker: 'exclusive',
	subjectText: articleFixture.fields?.headline ?? '',
	previewText: htmlToSingleLineText(articleFixture.fields?.trailText),
	showPreview: true,
	deliveryOption: 'immediate',
	audienceSegments: ['AU', 'UK'],
};

export const populatedNewsletterEmailComposerState = {
	...defaultComposerState,
	article: articleFixture,
	fetchedArticleId: articleFixture.id,
};

export const completeAppAlertFormValues: AppAlertFormValues = {
	alertType: 'breaking-news',
	headline: articleFixture.fields?.headline ?? '',
	deliveryOption: 'appImmediate',
	editions: ['UK', 'INT'],
	includeThumbnail: true,
	replacementImageUrl: '',
	articleThumbnailUrl: articleFixture.fields?.thumbnail ?? '',
};

export const populatedAppAlertComposerState: NotificationComposerState = {
	...defaultAppAlertComposerState,
	article: articleFixture,
	fetchedArticleId: articleFixture.id,
};
