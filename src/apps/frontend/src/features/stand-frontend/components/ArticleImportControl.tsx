import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { InlineMessage } from '@guardian/stand/InlineMessage';
import { TextInput } from '@guardian/stand/TextInput';
import { useContext } from 'react';
import { mockCapiFetch } from '../../../mocks/mock-capi-fetch';
import { NotificationFormContext } from '../NotificationContext';
import { LoadingSpinner } from './LoadingSpinner';

export const ArticleImportControl = () => {
	const { notification, updateNotification } = useContext(NotificationFormContext);

	const {
		articleId = '',
		fetchedArticleId,
		isFetchingContent,
		fetchArticleError,
	} = notification;

	const fetchArticle = () => {
		updateNotification({ type: 'waiting-for-article' });

		mockCapiFetch(articleId)
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
		articleId.length === 0 ||
		!!isFetchingContent ||
		articleId === fetchedArticleId;

	return (
		<div
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<TextInput
				label="Article"
				value={notification.articleId ?? ''}
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

				{!isFetchingContent && fetchedArticleId === articleId && (
					<InlineMessage level="success">Article Imported</InlineMessage>
				)}

				{fetchArticleError && (
					<InlineMessage level="error">{fetchArticleError}</InlineMessage>
				)}
			</div>
		</div>
	);
};
