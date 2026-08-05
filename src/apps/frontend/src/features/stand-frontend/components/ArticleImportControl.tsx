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
				gap: semanticSpacing.stackXs,
			}}
			id="article-section"
		>
			<TextInput
				isInvalid={!!failure}
				error={failure}
				label="Article"
				value={notification.articleInputText ?? ''}
				isDisabled={isFetchingContent}
				description="Copy and paste a Guardian URL below"
				onChange={(text) =>
					updateNotification({ type: 'set-article-id', text })
				}
			/>
			<div
				css={{
					display: 'flex',
					gap: semanticSpacing.stackSm,
					alignItems: 'center',
				}}
			>
				<Button
					isDisabled={disableFetchButton}
					icon="upload"
					size="sm"
					variant="secondary"
					onClick={fetchArticle}
					// TO DO - check why disabled styling not being applied by stand
					cssOverrides={
						disableFetchButton
							? css({
									backgroundColor: semanticColors.fill.disabled,
									cursor: 'not-allowed',
								})
							: undefined
					}
				>
					Fetch Article
				</Button>

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
