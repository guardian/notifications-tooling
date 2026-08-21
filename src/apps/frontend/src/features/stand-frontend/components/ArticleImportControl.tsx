import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import { ApiError } from '../../../api/errors';
import { htmlToSingleLineText } from '../../../util/html-helpers';
import { parseArticleUrlInputToContentId } from '../form-validation';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from '../notification-forms';
import { NotificationFormContext } from '../NotificationContext';
import { ArticlePreviewCard } from './ArticlePreviewCard';
import { LoadingSpinner } from './LoadingSpinner';

// TO DO - more helpful error UI
// can we capture when article was taken down?
const getUserFacingError = (err: unknown): string => {
	if (!(err instanceof ApiError)) {
		return err instanceof Error ? err.message : 'UNKNOWN ERROR';
	}

	switch (err.failure) {
		case 'unauthenticated':
		case 'forbidden':
		case 'timeout':
		case 'fetch-fail':
		case 'json-parse-fail':
		case 'schema-parse-fail':
			return err.message;
		case 'non-2xx-response':
			switch (err.status) {
				case 404:
					return 'The URL is in the right format, but there is no article live there';
				default:
					return err.message;
			}
	}
};

export interface ArticleImportControlProps {
	articleInputText: string;
	setArticleInputText: (setArticleInputText: string) => void;
	lockArticleInputText: boolean;
	setLockArticleInputText: (lockArticleInputText: boolean) => void;
}
export const ArticleImportControl = ({
	articleInputText,
	setArticleInputText,
	lockArticleInputText,
	setLockArticleInputText,
}: ArticleImportControlProps) => {
	const { channel, notification, updateNotification, capiFetch } = useContext(
		NotificationFormContext,
	);
	const {
		clearErrors,
		formState: { submitCount },
		setValue,
	} = useFormContext<NewsletterFormValues | AppAlertFormValues>();

	const { fetchedArticleId, isFetchingContent, fetchArticleError, content } =
		notification;

	const { failure, webUrl, articleId } =
		parseArticleUrlInputToContentId(articleInputText);

	const fetchArticle = () => {
		if (articleInputText === '') {
			updateNotification({
				type: 'report-article-error',
				errorMessage: 'Paste a URL to fetch an article',
			});
			return;
		}

		if (!webUrl) {
			return;
		}

		updateNotification({ type: 'waiting-for-article' });
		capiFetch({
			article: webUrl,
		})
			.then((responseBody) => {
				const { article } = responseBody;
				if (channel === 'email') {
					const { headline, standfirst } = article.fields ?? {};
					if (headline) {
						setValue('subject', headline);
					}
					const preview = htmlToSingleLineText(standfirst);
					if (preview) {
						setValue('preview', preview);
					}
				} else {
					setValue('headline', article.fields?.headline ?? article.webTitle);
				}
				clearErrors('root');
				updateNotification({
					type: 'receive-article',
					content: article,
				});
				setLockArticleInputText(true);
			})
			.catch((err) => {
				// TO DO - error reporting/telemetry
				updateNotification({
					type: 'report-article-error',
					errorMessage: getUserFacingError(err),
				});
			});
	};

	const showImportedArticle =
		!isFetchingContent && !!fetchedArticleId && fetchedArticleId === articleId;
	const showFieldErrors =
		failure ??
		(!content && submitCount > 0
			? 'Paste a URL to fetch an article'
			: undefined);

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				css={{
					display: 'flex',
					flexDirection: 'row',
					gap: semanticSpacing.stackSm,
					alignItems: 'flex-end',
				}}
			>
				<div
					css={{
						display: 'flex',
						flexDirection: 'column',
						gap: semanticSpacing.stackXxs,
					}}
				>
					<Typography variant="bodyBoldMd" element="h3">
						Article
					</Typography>
					{/*
						NOTE - we are not using the "description" field of the TextInput for this text
						as design does not want the colour shade to change when the TextInput is in the
						disabled state.
						*/}
					<Typography
						variant="helpTextFormMd"
						theme={{ color: semanticColors.text.weak }}
					>
						Copy and paste a Guardian article URL and fetch
					</Typography>

					<TextInput
						aria-label="article URL"
						isInvalid={!!showFieldErrors}
						size="sm"
						value={articleInputText}
						placeholder="https://www.theguardian.com/..."
						isDisabled={isFetchingContent || lockArticleInputText}
						onChange={setArticleInputText}
						cssOverrides={css({ width: '356px' })}
					/>
				</div>
				{!lockArticleInputText && (
					<Button
						isDisabled={isFetchingContent}
						icon="upload"
						size="sm"
						variant="secondary"
						onClick={fetchArticle}
					>
						Fetch
					</Button>
				)}
				{lockArticleInputText && (
					<Button
						isDisabled={isFetchingContent}
						icon="refresh"
						size="sm"
						variant="secondary"
						onClick={() => {
							setLockArticleInputText(false);
						}}
					>
						Replace
					</Button>
				)}
			</div>
			<div
				css={{
					display: 'flex',
					gap: semanticSpacing.stackSm,
					alignItems: 'left',
					paddingTop: semanticSpacing.stackXs,
					paddingBottom: semanticSpacing.stackXs,
				}}
			>
				{isFetchingContent && <LoadingSpinner />}

				{showImportedArticle && (
					<InlineMessage level="success">Article imported</InlineMessage>
				)}

				{fetchArticleError && (
					<InlineMessage level="error">{fetchArticleError}</InlineMessage>
				)}

				{showFieldErrors && (
					<InlineMessage level="error">{showFieldErrors}</InlineMessage>
				)}
			</div>

			{showImportedArticle && content && (
				<ArticlePreviewCard content={content} />
			)}
		</div>
	);
};
