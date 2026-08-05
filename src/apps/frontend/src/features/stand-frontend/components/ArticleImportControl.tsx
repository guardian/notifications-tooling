import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import {
	parseArticleUrlInputToContentId,
	validateNotificationForm,
} from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import { ArticlePreviewCard } from './ArticlePreviewCard';
import { LoadingSpinner } from './LoadingSpinner';

export const ArticleImportControl = () => {
	const { notification, updateNotification, capiFetch } = useContext(
		NotificationFormContext,
	);

	const {
		articleInputText = '',
		fetchedArticleId,
		isFetchingContent,
		fetchArticleError,
		hasAttemptedSend,
		content,
	} = notification;

	const { articleId, failure } =
		parseArticleUrlInputToContentId(articleInputText);

	const fetchArticle = () => {
		if (articleInputText === '') {
			updateNotification({
				type: 'report-article-error',
				errorMessage: 'Paste a URL to fetch an article',
			});
			return;
		}

		if (!articleId) {
			return;
		}

		updateNotification({ type: 'waiting-for-article' });
		capiFetch(articleId)
			.then((content) => {
				updateNotification({
					type: 'receive-article',
					content,
				});
			})
			.catch((err) => {
				// TO DO - error reporting/telemetry
				updateNotification({
					type: 'report-article-error',
					errorMessage: err instanceof Error ? err.message : 'UNKNOWN ERROR',
				});
			});
	};

	const showImportedArticle =
		!isFetchingContent && !!fetchedArticleId && fetchedArticleId === articleId;

	const requiredFieldErrors = validateNotificationForm(notification);
	const showFieldErrors =
		failure ??
		(requiredFieldErrors.article && hasAttemptedSend
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
					<Typography variant="bodyBoldMd" element="h3" id="article-section">
						Article
					</Typography>
					<TextInput
						isInvalid={!!showFieldErrors}
						size="sm"
						value={notification.articleInputText ?? ''}
						isDisabled={isFetchingContent}
						description="Copy and paste a Guardian article URL and fetch"
						onChange={(text) =>
							updateNotification({ type: 'set-article-id', text })
						}
						cssOverrides={css({ width: '356px' })}
					/>
				</div>
				<Button
					isDisabled={isFetchingContent}
					icon="upload"
					size="sm"
					variant="secondary"
					onClick={fetchArticle}
					cssOverrides={
						isFetchingContent
							? css({
									backgroundColor: semanticColors.fill.disabled,
									cursor: 'not-allowed',
								})
							: undefined
					}
				>
					{showImportedArticle ? 'Replace' : 'Fetch'}
				</Button>
			</div>
			<div
				css={{
					display: 'flex',
					gap: semanticSpacing.stackSm,
					alignItems: 'left',
				}}
			>
				{isFetchingContent && <LoadingSpinner />}

				{showImportedArticle && (
					<InlineMessage level="success">Article Imported</InlineMessage>
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
