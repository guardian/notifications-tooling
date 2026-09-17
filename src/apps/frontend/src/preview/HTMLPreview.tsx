import { css } from '@emotion/react';
import { HtmlPreview } from '@guardian/stand/HtmlPreviewLoader';
import { Typography } from '@guardian/stand/Typography';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { NotificationFormContext } from '../compose/NotificationFormContext';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';

// TO DO - this function will work with the current format of the notification emails
// but we should modidify the template used in email-rendering to include attributes
// to more robustly identify the elements to update
const modifyContent = (
	emailHtml: string,
	formValues: Partial<NewsletterEmailFormValues>,
): string => {
	const body = document.createElement('body');
	body.innerHTML = emailHtml;

	const { subjectText, previewText, showPreview = true } = formValues;
	const subjectTextElement = body.querySelector('h2');
	const previewTextElement =
		subjectTextElement?.parentElement?.querySelector<HTMLElement>('h2~div');

	if (subjectText && subjectTextElement) {
		subjectTextElement.innerText = subjectText;
	}
	if (previewTextElement) {
		previewTextElement.innerText = showPreview ? (previewText ?? '') : '';
	}
	Array.from(body.querySelectorAll('a')).forEach((link) =>
		link.removeAttribute('href'),
	);

	return body.innerHTML;
};

export const HTMLPreview = () => {
	const {
		composerState: { article, requestedUrl },
		requestEmailHtml,
	} = useContext(NotificationFormContext);
	const formValues = useWatch<NewsletterEmailFormValues>();
	const [emailHtml, setEmailHtml] = useState<string>();
	const [errorMessage, setErrorMessage] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);
	const stringifiedAudience = (formValues.audienceSegments ?? []).join();
	const webUrl = requestedUrl ?? article?.webUrl;

	const fetchHtml = useCallback(async () => {
		if (!webUrl) {
			return `<div>No article loaded</div>`;
		}
		const audience = stringifiedAudience
			.split(',')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);

		if (audience.length === 0) {
			return `<div>Choose an audience in order to preview the newsletter email</div>`;
		}
		const result = await requestEmailHtml({
			article: webUrl,
			audience: audience,
		});
		if (!result.success) {
			throw result.failure;
		}
		return result.data.html;
	}, [webUrl, requestEmailHtml, stringifiedAudience]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- ok
		setIsLoading(true);
		setErrorMessage(undefined);
		fetchHtml()
			.then(setEmailHtml)
			.catch((err) => {
				console.error(err);
				setErrorMessage('failed to load');
			})
			.finally(() => setIsLoading(false));
	}, [fetchHtml]);

	return (
		<HtmlPreview
			html={
				emailHtml
					? modifyContent(emailHtml, formValues)
					: `<div>no article html</div> `
			}
			errorMessage={errorMessage}
			isLoading={isLoading}
			title={
				<Typography variant="labelFormMd">Newsletter email preview</Typography>
			}
			widthOptions={[]}
			defaultWidth={400}
			cssOverrides={css({ width: '440px' })}
		/>
	);
};
