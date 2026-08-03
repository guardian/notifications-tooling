import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { useContext } from 'react';
import { parseArticleUrlInputToContentId } from '../form-validation';
import { NotificationFormContext } from '../NotificationContext';
import { ArticlePreviewCard } from './ArticlePreviewCard';
import { LoadingSpinner } from './LoadingSpinner';
import { Typography } from '@guardian/stand/Typography';

export const ArticleImportControl = () => {
	const { notification, updateNotification, capiFetch } = useContext(
		NotificationFormContext,
	);

	const {
		articleInputText = '',
		fetchedArticleId,
		isFetchingContent,
		fetchArticleError,
		content,
	} = notification;

	const { articleId, failure } =
		parseArticleUrlInputToContentId(articleInputText);

	const fetchArticle = () => {
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

	const disableFetchButton =
		!articleId || !!isFetchingContent || articleId === fetchedArticleId;

	const showImportedArticle =
		!isFetchingContent && !!fetchedArticleId && fetchedArticleId === articleId;

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
					<Typography variant="bodyBoldMd" element="label" id="article-section">
						Article
					</Typography>
					<TextInput
						isInvalid={!!failure}
						error={failure}
						size="sm"
						value={notification.articleInputText ?? ''}
						isDisabled={isFetchingContent}
						description="Copy and paste a Guardian article URL and fetch"
						onChange={(text) =>
							updateNotification({ type: 'set-article-id', text })
						}
						cssOverrides={{ width: '356px' }}
					/>
				</div>
				<Button
					isDisabled={disableFetchButton}
					icon="upload"
					size="sm"
					variant="secondary"
					onClick={fetchArticle}
					cssOverrides={
						disableFetchButton
							? css({
									backgroundColor: semanticColors.fill.disabled,
									cursor: 'not-allowed',
								})
							: undefined
					}
				>
					Fetch
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
			</div>

			{showImportedArticle && content && (
				<ArticlePreviewCard content={content} />
			)}
		</div>
	);
};
