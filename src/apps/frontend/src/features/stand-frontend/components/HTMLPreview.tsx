import { HtmlPreview } from '@guardian/stand/HtmlPreviewLoader';
import { Typography } from '@guardian/stand/Typography';
import { useCallback, useContext, useEffect, useState } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { kickerNameMap } from '../option-values';
import type { EmailNotification } from '../types';

const modifyContent = (
	emailHtml: string,
	parameters?: EmailNotification,
): string => {
	const body = document.createElement('body');
	body.innerHTML = emailHtml;

	const { subject, kicker, preview } = parameters ?? {};
	const headlineElement = body.querySelector('h2');
	const kickerElement =
		headlineElement?.parentElement?.querySelector<HTMLElement>(
			'div:first-child',
		);
	const previewElement =
		headlineElement?.parentElement?.querySelector<HTMLElement>(
			'h2~div',
		);

	if (subject && headlineElement) {
		headlineElement.innerText = subject;
	}
	if (kicker && kickerElement) {
		kickerElement.innerText = kickerNameMap[kicker];
	}
	if (preview && previewElement) {
		previewElement.innerText = preview;
	}

	return body.innerHTML;
};

export const HTMLPreview = () => {
	const {
		notification: { fetchedArticleId, parameters },
		requestEmailHtml: fetchEmailHtml,
	} = useContext(NotificationFormContext);
	const [emailHtml, setEmailHtml] = useState<string>();
	const [errorMessage, setErrorMessage] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);

	const audience = (parameters?.audienceSegments ?? []).join();
	const emailParameters = parameters?.type === 'email' ? parameters : undefined;

	const fetchHtml = useCallback(async () => {
		if (!fetchedArticleId) {
			return `<div>no article loaded</div>`;
		}
		return fetchEmailHtml(fetchedArticleId, { audience });
	}, [fetchedArticleId, fetchEmailHtml, audience]);

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
					? modifyContent(emailHtml, emailParameters)
					: `<div>no article html</div> `
			}
			errorMessage={errorMessage}
			isLoading={isLoading}
			title={
				<Typography variant="labelFormMd">Newsletter email preview</Typography>
			}
			widthOptions={[]}
			defaultWidth={400}
		/>
	);
};
