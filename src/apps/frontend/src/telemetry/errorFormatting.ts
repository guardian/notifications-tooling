import type { FieldErrors } from 'react-hook-form';
import type {
	AppAlertFormValues,
	NewsletterEmailFormValues,
} from '../utils/notification-forms';
import type { TelemetryTags } from './telemetryService';

const serialiseFieldErrors = (
	formErrors: FieldErrors<NewsletterEmailFormValues | AppAlertFormValues>,
): TelemetryTags => {
	return Object.fromEntries(
		Object.entries(formErrors).reduce(
			(previousValue: Array<[string, string]>, [key, fieldError]) => {
				const { message } = fieldError;
				if (!message) {
					return previousValue;
				}
				return [...previousValue, [key, message]];
			},
			[],
		),
	);
};

export const NO_ARTICLE_ERROR = { article: 'no article imported' } as const;

export const serialiseFormValidationErrors = (
	formErrors: FieldErrors<NewsletterEmailFormValues | AppAlertFormValues>,
	missingArticle: boolean,
) => {
	return {
		...serialiseFieldErrors(formErrors),
		...(!missingArticle ? NO_ARTICLE_ERROR : undefined),
	};
};
