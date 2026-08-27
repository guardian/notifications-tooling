import {
	baseColors,
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import type { NewsletterFormValues } from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { LoadingSpinner } from './LoadingSpinner';

// TO DO - this function will work with the current format of the notifcation emails
// but we shoudl modidify the template used in email-rendering to include attributes
// to more robustly identify the elements to update
const modifyContent = (
	body: HTMLElement,
	parameters: Partial<NewsletterFormValues>,
) => {
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
};

export const HTMLPreview = () => {
	const {
		notification: { content },
		requestEmailHtml,
	} = useContext(NotificationFormContext);
	const parameters = useWatch<NewsletterFormValues>();
	const [emailHtml, setEmailHtml] = useState<string>();

	const [previewContainerElement, setPreviewContainerElement] =
		useState<HTMLElement | null>(null);

	const [errorMessage, setErrorMessage] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);
	const stringifiedAudience = (parameters.audienceSegments ?? []).join();
	const { webUrl } = content ?? {};

	const fetchHtml = useCallback(async () => {
		if (!webUrl) {
			return `<div>no article loaded</div>`;
		}
		const audience = stringifiedAudience
			.split(',')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);

		if (audience.length === 0) {
			return `<div>no audience</div>`;
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
		if (!previewContainerElement || !emailHtml) {
			return;
		}

		const articleElement = previewContainerElement.querySelector('article');
		if (!articleElement) {
			return;
		}
		articleElement.innerHTML = emailHtml;
	}, [previewContainerElement, emailHtml]);

	useEffect(() => {
		if (!previewContainerElement) {
			return;
		}

		modifyContent(previewContainerElement, parameters);
	}, [parameters, previewContainerElement]);

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
		<figure>
			<figcaption css={{ paddingBottom: semanticSpacing.stackSm }}>
				<Typography variant="labelFormMd">Newsletter email preview</Typography>
			</figcaption>
			{!emailHtml && <div>no article html</div>}
			{errorMessage && <div>{errorMessage}</div>}
			{isLoading && <LoadingSpinner />}
			<div
				ref={setPreviewContainerElement}
				css={{
					width: 440,
					borderWidth: semanticSizing.border.default,
					borderColor: semanticColors.border.strong,
					borderStyle: 'solid',
					backgroundColor: baseColors.neutral[900],
				}}
			>
				<article></article>
			</div>
		</figure>
	);
};
