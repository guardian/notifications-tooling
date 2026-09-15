import { css } from '@emotion/react';
import {
	baseColors,
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { Typography } from '@guardian/stand/Typography';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { NotificationFormContext } from '../compose/NotificationContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { NewsletterFormValues } from '../utils/notification-forms';

// TO DO - this function will work with the current format of the notification emails
// but we should modify the template used in email-rendering to include attributes
// to more robustly identify the elements to update
const modifyContent = (
	body: HTMLElement,
	parameters: Partial<NewsletterFormValues>,
) => {
	const { subject, preview, showPreview } = parameters;
	const headlineElement = body.querySelector('h2');
	const previewElement =
		headlineElement?.parentElement?.querySelector<HTMLElement>('h2~div');

	if (subject && headlineElement) {
		headlineElement.innerText = subject;
	}
	if (previewElement) {
		previewElement.innerText = showPreview && preview ? preview : '';
	}
	Array.from(body.querySelectorAll('a')).forEach((link) =>
		link.removeAttribute('href'),
	);
};

type PreviewData = {
	html?: string | undefined;
	error?: string | undefined;
	info?: string | undefined;
};

const styles = {
	previewFrame: css({
		maxWidth: 440,
		borderWidth: semanticSizing.border.default,
		borderColor: semanticColors.border.strong,
		borderStyle: 'solid',
		backgroundColor: baseColors.neutral[900],
		position: 'relative',
	}),
	placeHolder: css({
		minHeight: 300,
		backgroundColor: baseColors.neutral[700],
		color: baseColors.neutral[0],
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}),
	spinnerContainer: css({
		position: 'absolute',
		inset: 0,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backdropFilter: 'blur(2px)',
	}),
};

export const NewsletterEmailPreview = () => {
	const {
		notification: { content },
		requestEmailHtml,
	} = useContext(NotificationFormContext);
	const { webUrl } = content ?? {};
	const parameters = useWatch<NewsletterFormValues>();
	const stringifiedAudience = (parameters.audienceSegments ?? []).join();

	const [previewContainerElement, setPreviewContainerElement] =
		useState<HTMLElement | null>(null);
	const [preview, setPreview] = useState<PreviewData>();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const articleElement = previewContainerElement?.querySelector('article');
		if (!articleElement) {
			return;
		}
		articleElement.innerHTML = preview?.html ?? '';
		if (preview?.html) {
			modifyContent(articleElement, parameters);
		}
	}, [previewContainerElement, preview, parameters]);

	useEffect(() => {
		const articleElement = previewContainerElement?.querySelector('article');
		if (!articleElement) {
			return;
		}
		modifyContent(articleElement, parameters);
	}, [parameters, previewContainerElement]);

	const getPreviewData = useCallback(async (): Promise<PreviewData> => {
		if (!webUrl) {
			return {
				info: 'No article loaded',
			};
		}
		const audience = stringifiedAudience
			.split(',')
			.map((item) => item.trim())
			.filter((item) => item.length > 0);

		if (audience.length === 0) {
			return {
				info: 'Choose an audience in order to preview the newsletter email',
			};
		}
		const result = await requestEmailHtml({
			article: webUrl,
			audience: audience,
		});

		if (!result.success) {
			return {
				error: result.failure.message,
			};
		}
		return {
			html: result.data.html,
		};
	}, [webUrl, requestEmailHtml, stringifiedAudience]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- ok
		setIsLoading(true);
		setPreview((preview) => ({
			errorMessage: undefined,
			info: undefined,
			html: preview?.html,
		}));
		void getPreviewData().then((result) => {
			setPreview(result);
			setIsLoading(false);
		});
	}, [getPreviewData]);

	return (
		<figure>
			<figcaption css={{ paddingBottom: semanticSpacing.stackSm }}>
				<Typography variant="labelFormMd">Newsletter email preview</Typography>
			</figcaption>

			{preview?.error && (
				<InlineMessage level="error">{preview.error}</InlineMessage>
			)}
			{preview?.info && (
				<InlineMessage level="information">{preview.info}</InlineMessage>
			)}

			<div ref={setPreviewContainerElement} css={styles.previewFrame}>
				<article></article>
				{!preview?.html && (
					<div css={styles.placeHolder}>Generated newsletter email preview</div>
				)}
				{isLoading && (
					<div css={styles.spinnerContainer}>
						<LoadingSpinner fontSize={100} />
					</div>
				)}
			</div>
		</figure>
	);
};
