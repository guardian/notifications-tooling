import { css } from '@emotion/react';
import { HtmlPreview } from '@guardian/stand/HtmlPreviewLoader';
import { Typography } from '@guardian/stand/Typography';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { NotificationFormContext } from '../compose/NotificationContext';
import type { NewsletterFormValues } from '../utils/notification-forms';

// TO DO - this function will work with the current format of the notification emails
// but we should modidify the template used in email-rendering to include attributes
// to more robustly identify the elements to update
const modifyContent = (
	emailHtml: string,
	parameters: Partial<NewsletterFormValues>,
): string => {
	const body = document.createElement('body');
	body.innerHTML = emailHtml;

	const { subject, preview } = parameters;
	const headlineElement = body.querySelector('h2');
	const previewElement =
		headlineElement?.parentElement?.querySelector<HTMLElement>('h2~div');

	if (subject && headlineElement) {
		headlineElement.innerText = subject;
	}
	if (preview && previewElement) {
		previewElement.innerText = preview;
	}
	Array.from(body.querySelectorAll('a')).forEach((link) =>
		link.removeAttribute('href'),
	);

	return body.innerHTML;
};

export const HTMLPreview = () => {
	const {
		notification: { content },
		requestEmailHtml,
	} = useContext(NotificationFormContext);
	const parameters = useWatch<NewsletterFormValues>();
	const [emailHtml, setEmailHtml] = useState<string>();
	const [errorMessage, setErrorMessage] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);
	const stringifiedAudience = (parameters.audienceSegments ?? []).join();
	const { webUrl } = content ?? {};

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
					? modifyContent(emailHtml, parameters)
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
