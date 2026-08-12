import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext, useState } from 'react';
import { ApiError } from '../../../api/errors';
import {
	parseArticleUrlInputToContentId,
	validateNotificationForm,
} from '../form-validation';
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

export const ArticleImportControl = () => {
	const { notification, updateNotification, capiFetch } = useContext(
		NotificationFormContext,
	);

	const {
		fetchedArticleId,
		isFetchingContent,
		fetchArticleError,
		hasAttemptedSend,
		content,
	} = notification;

	const [articleInputText, setArticleInputText] = useState(
		() => content?.webUrl ?? '',
	);

	const [lockArticleInputText, setLockArticleInputText] = useState(false);

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
				updateNotification({
					type: 'receive-article',
					content: responseBody.article,
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

	const requiredFieldErrors = validateNotificationForm(notification);
	const showFieldErrors =
		failure ??
		(requiredFieldErrors.includes('article') && hasAttemptedSend
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
				id="article-section"
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
						gap: semanticSpacing.stackSm,
					}}
				>
					<Typography variant="bodyBoldMd" element="h3">
						Article
					</Typography>
					<TextInput
						aria-label="article URL"
						isInvalid={!!showFieldErrors}
						size="sm"
						value={articleInputText}
						placeholder="https://www.theguardian.com/..."
						isDisabled={isFetchingContent || lockArticleInputText}
						description="Copy and paste a Guardian article URL and fetch"
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
